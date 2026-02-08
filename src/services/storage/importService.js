import { supabase } from './supabaseService';
import * as XLSX from 'xlsx';

export const importService = {
    /**
     * Entry point to parse LinkedIn files based on extension
     */
    parseLinkedInFile(file, content) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension === 'xlsx' || extension === 'xls') {
            return this.parseLinkedInXLSX(content);
        } else if (extension === 'csv') {
            return this.parseLinkedInCSV(content);
        } else {
            throw new Error(`Formato de arquivo .${extension} não suportado.`);
        }
    },

    /**
     * Parses LinkedIn XLSX content and extracts metrics
     */
    parseLinkedInXLSX(binaryData) {
        try {
            const workbook = XLSX.read(binaryData, { type: 'array', cellDates: true });
            let results = {
                metrics: [],
                demographics: [],
                followers: null
            };
            let foundAny = false;

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 1) continue;

                // --- 1. Detect Metrics Table ---
                let headerIndex = -1;
                for (let i = 0; i < Math.min(jsonData.length, 30); i++) {
                    const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                    const hasMetrics = rowStr.includes('impress') || rowStr.includes('engajamento') || rowStr.includes('alcançad');
                    const hasDimension = rowStr.includes('url') || rowStr.includes('data') || rowStr.includes('título');

                    if (hasMetrics && hasDimension) {
                        headerIndex = i;
                        break;
                    }
                }

                if (headerIndex !== -1) {
                    const headers = jsonData[headerIndex];
                    const dataRows = jsonData.slice(headerIndex + 1);

                    const metrics = dataRows.map(row => {
                        if (!row || row.length < 2) return null;
                        const entry = {};
                        headers.forEach((h, idx) => { if (h) entry[h] = row[idx]; });
                        const mapped = this.mapLinkedInFields(entry);
                        if (mapped.impressions === 0 && mapped.reactions === 0 && !mapped.post_id) return null;
                        return mapped;
                    }).filter(Boolean);

                    if (metrics.length > 0) {
                        results.metrics = [...results.metrics, ...metrics];
                        foundAny = true;
                    }
                }

                // --- 2. Detect Demographics Table ---
                let demoHeaderIndex = -1;
                for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
                    const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                    if (rowStr.includes('principais dados demográficos') && rowStr.includes('porcentagem')) {
                        demoHeaderIndex = i;
                        break;
                    }
                }

                if (demoHeaderIndex !== -1) {
                    const dataRows = jsonData.slice(demoHeaderIndex + 1);
                    const demographics = dataRows.map(row => {
                        if (!row || row.length < 3) return null;
                        const category = row[0];
                        const label = row[1];
                        const percentage = row[2];
                        if (!category || !label || percentage === undefined) return null;

                        // Parse percentage (e.g., "10%", "menos de 1%" or just 0.1)
                        let val = 0;
                        if (typeof percentage === 'string') {
                            val = parseFloat(percentage.replace(/%/g, '').replace(',', '.'));
                        } else {
                            val = percentage * 100; // XLSX might read 10% as 0.1
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
                for (let i = 0; i < Math.min(jsonData.length, 50); i++) {
                    const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                    if (rowStr.includes('total de seguidores') || rowStr.includes('total followers')) {
                        // Usually the count is in the next cell or same cell
                        const row = jsonData[i];
                        const countStr = row.find(cell => !isNaN(parseInt(cell?.toString().replace(/\D/g, ''))));
                        if (countStr) {
                            results.followers = parseInt(countStr.toString().replace(/\D/g, ''));
                            foundAny = true;
                        }
                    }
                }
            }

            if (!foundAny) {
                throw new Error('Não conseguimos identificar dados de métricas, demográficos ou seguidores no arquivo.');
            }

            return results;
        } catch (error) {
            console.error('Error parsing XLSX:', error);
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

        return dataRows.map(row => {
            if (!row.trim()) return null;
            const values = this.splitCSVLine(row);
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            return this.mapLinkedInFields(entry);
        }).filter(Boolean);
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
            // Clean strings: remove spaces, %, and handle Portuguese decimal comma
            let str = val.toString().replace(/%/g, '').trim();
            // Detect if it uses comma as decimal or thousands separator
            // Typical Brazilian: 1.234,56 -> we want 1234.56
            // Typical US: 1,234.56 -> we want 1234.56
            if (str.includes(',') && !str.includes('.')) {
                str = str.replace(/,/g, '.');
            } else if (str.includes(',') && str.includes('.')) {
                // If both exist, assume comma is thousands if it comes first
                if (str.indexOf(',') < str.indexOf('.')) {
                    str = str.replace(/,/g, '');
                } else {
                    str = str.replace(/\./g, '').replace(/,/g, '.');
                }
            } else if (str.includes('.')) {
                // Might be thousands separator "1.234" (Brazilian)
                // or decimal "1.23". If it has 3 digits after dot, assume thousands? Risky.
                // Better: if there are multiple dots, remove all but last maybe?
                // For now, assume it's a valid float if it only has one dot.
            }
            const n = parseFloat(str);
            return isNaN(n) ? 0 : n;
        };

        const parseDate = (val) => {
            if (!val) return new Date().toISOString();
            if (val instanceof Date) return val.toISOString();

            // Handle strings like "02/07/2026"
            const parts = val.toString().split(/[\/-]/);
            if (parts.length === 3) {
                // Assume DD/MM/YYYY or YYYY-MM-DD
                if (parts[0].length === 4) return new Date(val).toISOString();
                const d = parseInt(parts[0]);
                const m = parseInt(parts[1]) - 1;
                const y = parseInt(parts[2]);
                return new Date(y, m, d).toISOString();
            }
            return new Date(val).toISOString();
        };

        return {
            title: getField(['Share title', 'Título da publicação', 'Content', 'Conteúdo']) || 'Post sem título',
            published_at: parseDate(getField(['Date', 'Data', 'Data de publicação'])),
            impressions: Math.round(parseNum(getField(['Impressions', 'Impressões']))),
            reactions: Math.round(parseNum(getField(['Reactions', 'Reações', 'Likes', 'Engajamento', 'Interações']))),
            comments: Math.round(parseNum(getField(['Comments', 'Comentários']))),
            shares: Math.round(parseNum(getField(['Shares', 'Compartilhamentos', 'Reposts']))),
            engagement_rate: parseFloat(parseNum(getField(['Engagement rate', 'Taxa de engajamento']))).toFixed(2),
            post_id: getField(['Post link', 'URL da publicação', 'ID', 'URL']) || ''
        };
    },

    /**
     * Saves imported data to Supabase with error handling
     */
    async saveImportedData(userId, fileName, fileSize, results) {
        console.log('Starting saveImportedData v2.1 for user:', userId);
        if (!userId) return { success: false, error: 'Usuário não autenticado.' };

        const { metrics, demographics, followers } = results;
        if (!metrics?.length && !demographics?.length && !followers) {
            return { success: false, error: 'Nenhum dado novo encontrado no arquivo.' };
        }

        try {
            // 1. Log the import
            const { data: logData, error: logError } = await supabase
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
            console.log('Log created successfully:', logData.id);

            // 2. Insert metrics (Post performance)
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

            // 3. Insert Demographics
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

            // 4. Insert Followers
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
