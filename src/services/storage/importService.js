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
            let allResults = [];
            let foundSheet = false;

            // Iterate through sheets to find "Publicações", "Updates", or sheets with post metrics
            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) continue;

                // Find header row for this sheet
                let headerIndex = -1;
                for (let i = 0; i < Math.min(jsonData.length, 30); i++) { // Check first 30 rows
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

                    const sheetResults = dataRows.map(row => {
                        // Skip if row is empty or too short
                        if (!row || row.length < 2) return null;

                        // Check if row has any actual data
                        const hasAnyData = row.some(cell => cell !== null && cell !== undefined && cell !== '');
                        if (!hasAnyData) return null;

                        const entry = {};
                        headers.forEach((header, index) => {
                            if (header) {
                                // If column appears twice (like in side-by-side tables), 
                                // take the non-null value if possible
                                const val = row[index];
                                if (val !== null && val !== undefined && val !== '') {
                                    entry[header] = val;
                                } else if (!entry[header]) {
                                    entry[header] = val;
                                }
                            }
                        });

                        // Only return if we mapped at least one metric and one dimension
                        const mapped = this.mapLinkedInFields(entry);
                        if (mapped.impressions === 0 && mapped.reactions === 0 && !mapped.post_id) return null;

                        return mapped;
                    }).filter(Boolean);

                    if (sheetResults.length > 0) {
                        allResults = [...allResults, ...sheetResults];
                        foundSheet = true;
                        console.log(`Dados encontrados na aba: ${sheetName} (${sheetResults.length} registros)`);
                    }
                }
            }

            if (!foundSheet || allResults.length === 0) {
                throw new Error('Não encontramos uma tabela de dados (com colunas como "Data", "Impressões" ou "URL") em nenhuma das abas do arquivo.');
            }

            return allResults;
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
    async saveImportedData(userId, fileName, fileSize, metrics) {
        console.log('Starting saveImportedData for user:', userId);
        if (!userId) return { success: false, error: 'Usuário não autenticado.' };
        if (!metrics || metrics.length === 0) return { success: false, error: 'Nenhum dado encontrado no arquivo.' };

        try {
            // 1. Log the import
            console.log('Inserting log for file:', fileName);
            const { data: logData, error: logError } = await supabase
                .from('imported_files_log')
                .insert({
                    user_id: userId,
                    file_name: fileName,
                    file_size: fileSize,
                    rows_count: metrics.length
                })
                .select()
                .single();

            if (logError) {
                console.error('Error in imported_files_log insert:', logError);
                throw logError;
            }

            if (!logData) {
                console.error('Insert succeeded but no data returned (RLS issue?)');
                throw new Error('O registro do log foi criado mas não retornou os dados. Verifique as permissões (RLS) no Supabase.');
            }

            console.log('Log created successfully with ID:', logData.id);

            // 2. Insert metrics with local deduplication to prevent "ON CONFLICT DO UPDATE affect row a second time"
            const uniqueMetrics = new Map();
            metrics.forEach(m => {
                const key = `${userId}-${m.post_id}`;
                // Last post for the same ID wins
                uniqueMetrics.set(key, {
                    ...m,
                    user_id: userId,
                    source_file_id: logData.id
                });
            });

            const metricsToInsert = Array.from(uniqueMetrics.values());

            console.log(`Upserting ${metricsToInsert.length} unique metrics rows...`);
            const { error: metricsError } = await supabase
                .from('metrics_history')
                .upsert(metricsToInsert, {
                    onConflict: 'user_id,post_id'
                });

            if (metricsError) {
                console.error('Error in metrics_history insert:', metricsError);
                throw metricsError;
            }

            return { success: true, count: metrics.length };
        } catch (error) {
            console.error('Error saving imported data:', error);
            return { success: false, error: error.message || 'Erro inesperado ao salvar no banco de dados.' };
        }
    }
};
