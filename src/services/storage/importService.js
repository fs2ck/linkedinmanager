import { supabase } from './supabaseService';
import ExcelJS from 'exceljs';

export const importService = {
    /**
     * Entry point to parse LinkedIn files based on extension
     */
    async parseLinkedInFile(file, content) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension === 'xlsx' || extension === 'xls') {
            return await this.parseLinkedInXLSX(content);
        } else if (extension === 'csv') {
            // content for CSV is likely text, but if it came as binary buffer we might need to decode
            // assuming content is ArrayBuffer for XLSX and string/text for CSV? 
            // The previous implementation treated 'content' as something XLSX.read could handle (ArrayBuffer/String)
            // If the caller passes ArrayBuffer for both, we need to decode CSV.
            let csvText = content;
            if (content instanceof ArrayBuffer) {
                const decoder = new TextDecoder('utf-8');
                csvText = decoder.decode(content);
            }
            return this.parseLinkedInCSV(csvText);
        } else {
            throw new Error(`Formato de arquivo .${extension} não suportado.`);
        }
    },

    /**
     * Parses LinkedIn XLSX content and extracts metrics using ExcelJS
     */
    async parseLinkedInXLSX(arrayBuffer) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            let results = {
                metrics: [],
                demographics: [],
                followers: null
            };
            let foundAny = false;

            // Iterate over all worksheets
            workbook.eachSheet((worksheet, sheetId) => {
                const rows = [];
                worksheet.eachRow({ includeEmpty: true }, (row) => {
                    rows.push(row.values.slice(1));
                });

                if (rows.length < 1) return;

                // Find all potential headers
                const headerIndices = [];
                for (let i = 0; i < Math.min(rows.length, 100); i++) {
                    const rowStr = JSON.stringify(rows[i] || []).toLowerCase();
                    const hasMetrics = rowStr.includes('impress') || rowStr.includes('engajamento') || rowStr.includes('alcançad');
                    const hasDimension = rowStr.includes('url') || rowStr.includes('data') || rowStr.includes('título');

                    if (hasMetrics && hasDimension) {
                        // Check if this is a real header (not just a data row containing keywords)
                        if (rows[i].length >= 2) {
                            headerIndices.push(i);
                        }
                    }
                }

                // Process each table found
                headerIndices.forEach(hIndex => {
                    const headers = rows[hIndex];
                    const dataRows = [];

                    // Collect rows until an empty row or a new header is found
                    for (let j = hIndex + 1; j < rows.length; j++) {
                        const row = rows[j];
                        if (!row || row.length === 0 || (row.every(c => !c) && j > hIndex + 5)) break;
                        // Stop if we hit another header
                        if (headerIndices.includes(j)) break;
                        dataRows.push(row);
                    }

                    const metrics = dataRows.map(row => {
                        if (!row || row.length < 2) return null;
                        const entry = {};
                        headers.forEach((h, idx) => { if (h) entry[h] = row[idx]; });
                        const mapped = this.mapLinkedInFields(entry);

                        // Handle Daily Metrics specifically (rows with Date but no URL)
                        if (!mapped.post_id && mapped.published_at) {
                            const dateStr = mapped.published_at.split('T')[0];
                            mapped.post_id = `DAILY_TOTAL_${dateStr}`;
                            mapped.title = `Total Diário: ${dateStr}`;
                        }

                        // Filter out empty rows or total rows
                        if (mapped.impressions === 0 && mapped.reactions === 0 && !mapped.post_id) return null;
                        return mapped;
                    }).filter(Boolean);

                    if (metrics.length > 0) {
                        results.metrics = [...results.metrics, ...metrics];
                        foundAny = true;
                    }
                });

                // --- 2. Detect Demographics Table ---
                let demoHeaderIndex = -1;
                for (let i = 0; i < Math.min(rows.length, 150); i++) {
                    const rowStr = JSON.stringify(rows[i] || []).toLowerCase();
                    if (rowStr.includes('principais dados demográficos') || (rowStr.includes('principais') && rowStr.includes('porcentagem'))) {
                        demoHeaderIndex = i;
                        break;
                    }
                }

                if (demoHeaderIndex !== -1) {
                    const dataRows = rows.slice(demoHeaderIndex + 1);
                    const demographics = dataRows.map(row => {
                        if (!row || row.length < 3) return null;
                        const category = row[0];
                        const label = row[1];
                        const percentage = row[2];
                        if (!category || !label || percentage === undefined) return null;

                        let val = 0;
                        if (typeof percentage === 'string') {
                            const cleanStr = percentage.toLowerCase().replace(/%/g, '').replace(',', '.').trim();
                            val = cleanStr.includes('menos de') ? 0.5 : parseFloat(cleanStr);
                        } else if (typeof percentage === 'number') {
                            val = percentage < 1 ? percentage * 100 : percentage;
                        }

                        if (isNaN(val)) val = 0;
                        return { category, label, value_percent: val };
                    }).filter(Boolean);

                    if (demographics.length > 0) {
                        results.demographics = [...results.demographics, ...demographics];
                        foundAny = true;
                    }
                }

                // --- 3. Detect Followers Count ---
                for (let i = 0; i < Math.min(rows.length, 150); i++) {
                    const rowStr = JSON.stringify(rows[i] || []).toLowerCase();
                    if (rowStr.includes('total de seguidores') || rowStr.includes('total followers')) {
                        const row = rows[i];
                        const countCell = row.find(cell => {
                            if (!cell) return false;
                            const str = cell.toString();
                            if (str.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/)) return false;
                            const num = parseInt(str.replace(/\D/g, ''));
                            return !isNaN(num) && num > 0;
                        });

                        if (countCell) {
                            results.followers = parseInt(countCell.toString().replace(/\D/g, ''));
                            foundAny = true;
                        }
                    }
                }
            });

            if (!foundAny) {
                // Fallback error or maybe just return empty results?
                // Original logic threw error, keeping it consistent
                throw new Error('Não conseguimos identificar dados de métricas, demográficos ou seguidores no arquivo.');
            }

            return results;
        } catch (error) {
            console.error('Error parsing XLSX with ExcelJS:', error);
            throw error;
        }
    },

    /**
     * Parses LinkedIn CSV content
     */
    parseLinkedInCSV(csvContent) {
        const lines = csvContent.split(/\r?\n/);
        if (lines.length < 2) return [];

        let headerIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (line.includes('impressions') || line.includes('impressões')) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) {
            throw new Error('Relatório CSV não reconhecido.');
        }

        const headers = lines[headerIndex].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRows = lines.slice(headerIndex + 1);

        const metrics = dataRows.map(row => {
            if (!row.trim()) return null;
            const values = this.splitCSVLine(row);
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            return this.mapLinkedInFields(entry);
        }).filter(Boolean);

        return {
            metrics,
            demographics: [],
            followers: null
        };
    },

    splitCSVLine(line) {
        const result = [];
        let curValue = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                result.push(curValue.trim());
                curValue = '';
            } else {
                curValue += char;
            }
        }
        result.push(curValue.trim());
        return result;
    },

    /**
     * More robust field mapping
     */
    mapLinkedInFields(entry) {
        const getField = (keys) => {
            for (const key of keys) {
                const foundKey = Object.keys(entry).find(k => k.toLowerCase().includes(key.toLowerCase()));
                if (foundKey) return entry[foundKey];
            }
            return null;
        };

        const parseNum = (val) => {
            if (val === null || val === undefined) return 0;
            if (typeof val === 'number') return isNaN(val) ? 0 : val;
            // ExcelJS rich text handling (sometimes returns object { richText: [] })
            if (typeof val === 'object' && val.richText) {
                val = val.richText.map(r => r.text).join('');
            }

            let str = val.toString().replace(/%/g, '').trim();
            if (str.includes(',') && !str.includes('.')) {
                str = str.replace(/,/g, '.');
            } else if (str.includes(',') && str.includes('.')) {
                if (str.indexOf(',') < str.indexOf('.')) {
                    str = str.replace(/,/g, '');
                } else {
                    str = str.replace(/\./g, '').replace(/,/g, '.');
                }
            }
            const n = parseFloat(str);
            return isNaN(n) ? 0 : n;
        };

        const parseDate = (val) => {
            if (!val) return new Date().toISOString();
            if (val instanceof Date) return val.toISOString();

            const parts = val.toString().split(/[\/-]/);
            if (parts.length === 3) {
                if (parts[0].length === 4) return new Date(val).toISOString();
                const d = parseInt(parts[0]);
                const m = parseInt(parts[1]) - 1;
                const y = parseInt(parts[2]);
                return new Date(y, m, d).toISOString();
            }
            return new Date(val).toISOString();
        };

        let post_id = getField(['Post link', 'URL da publicação', 'ID', 'URL']) || '';
        // ExcelJS hyperlink object handling
        if (post_id && typeof post_id === 'object') {
            post_id = post_id.text || post_id.hyperlink || post_id.result || '';
        }
        post_id = post_id.toString();

        return {
            title: getField(['Share title', 'Título da publicação', 'Content', 'Conteúdo']) || 'Post sem título',
            published_at: parseDate(getField(['Date', 'Data', 'Data de publicação'])),
            impressions: Math.round(parseNum(getField(['Impressions', 'Impressões']))),
            reactions: Math.round(parseNum(getField(['Reactions', 'Reações', 'Likes', 'Engajamento', 'Interações']))),
            comments: Math.round(parseNum(getField(['Comments', 'Comentários']))),
            shares: Math.round(parseNum(getField(['Shares', 'Compartilhamentos', 'Reposts']))),
            engagement_rate: parseFloat(parseNum(getField(['Engagement rate', 'Taxa de engajamento']))).toFixed(2),
            post_id: post_id
        };
    },

    /**
     * Saves imported data to Supabase (unchanged logic, just ensuring compatibility)
     */
    async saveImportedData(userId, fileName, fileSize, results) {
        console.log('Starting saveImportedData v2.2 (ExcelJS) for user:', userId);
        if (!userId) return { success: false, error: 'Usuário não autenticado.' };

        const { metrics, demographics, followers } = results;
        if (!metrics?.length && !demographics?.length && !followers) {
            return { success: false, error: 'Nenhum dado novo encontrado no arquivo.' };
        }

        try {
            // Idempotency check
            const { data: existingLog } = await supabase
                .from('imported_files_log')
                .select('*')
                .eq('file_name', fileName)
                .eq('file_size', fileSize)
                .order('imported_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            let logData;
            if (existingLog) {
                console.log('File already imported updates will be applied to existing log:', existingLog.id);
                logData = existingLog;
                await supabase.from('demographics_history').delete().eq('source_file_id', logData.id);
                await supabase.from('followers_history').delete().eq('source_file_id', logData.id);
            } else {
                const { data: newLog, error: logError } = await supabase
                    .from('imported_files_log')
                    .insert({
                        user_id: userId,
                        file_name: fileName,
                        file_size: fileSize,
                        rows_count: (metrics?.length || 0) + (demographics?.length || 0)
                    })
                    .select()
                    .single();
                if (logError) throw logError;
                logData = newLog;
            }

            // Insert metrics
            if (metrics?.length > 0) {
                const uniqueMetrics = new Map();
                metrics.forEach(m => {
                    const key = `${userId}-${m.post_id}`;
                    uniqueMetrics.set(key, { ...m, user_id: userId, source_file_id: logData.id });
                });
                const metricsToInsert = Array.from(uniqueMetrics.values());

                const { error: mError } = await supabase
                    .from('metrics_history')
                    .upsert(metricsToInsert, { onConflict: 'user_id,post_id' });
                if (mError) throw mError;
            }

            // Insert Demographics
            if (demographics?.length > 0) {
                const demoToInsert = demographics.map(d => ({
                    ...d,
                    user_id: userId,
                    source_file_id: logData.id
                }));
                const { error: dError } = await supabase
                    .from('demographics_history')
                    .insert(demoToInsert);
                if (dError) throw dError;
            }

            // Insert Followers
            if (followers) {
                const { error: fError } = await supabase
                    .from('followers_history')
                    .insert({
                        user_id: userId,
                        follower_count: followers,
                        source_file_id: logData.id
                    });
                if (fError) throw fError;
            }

            return {
                success: true,
                count: metrics?.length || 0,
                hasDemographics: demographics?.length > 0,
                hasFollowers: !!followers
            };
        } catch (error) {
            console.error('Error saving imported data:', error);
            return { success: false, error: error.message || 'Erro inesperado ao salvar no banco de dados.' };
        }
    }
};
