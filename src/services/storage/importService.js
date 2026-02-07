import { supabase } from './supabaseService';

export const importService = {
    /**
     * Parses LinkedIn CSV content and extracts metrics
     * Support for "Updates" analytics export
     */
    parseLinkedInCSV(csvContent) {
        const lines = csvContent.split('\n');
        if (lines.length < 2) return [];

        // Simple CSV parser (assuming standard LinkedIn export format)
        // Note: LinkedIn sometimes has a header row that isn't the first row, 
        // or uses different encodings. This is a baseline.

        // Find the header row (contains 'Impressions' or 'Impressões')
        let headerIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes('impressions') || lines[i].toLowerCase().includes('impressões')) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) {
            throw new Error('Formato de arquivo não reconhecido. Certifique-se de que é um relatório de "Publicações" do LinkedIn.');
        }

        const headers = lines[headerIndex].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRows = lines.slice(headerIndex + 1);

        const results = dataRows.map(row => {
            const values = this.splitCSVLine(row);
            if (values.length < headers.length) return null;

            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });

            return this.mapLinkedInFields(entry);
        }).filter(Boolean);

        return results;
    },

    /**
     * Helper to split CSV line handling quotes
     */
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
     * Map messy LinkedIn headers to our clean schema
     */
    mapLinkedInFields(entry) {
        // LinkedIn column names can vary by language/version
        const getField = (keys) => {
            for (const key of keys) {
                const foundKey = Object.keys(entry).find(k => k.toLowerCase().includes(key.toLowerCase()));
                if (foundKey) return entry[foundKey];
            }
            return null;
        };

        return {
            title: getField(['Share title', 'Título da publicação', 'Content', 'Conteúdo']) || 'Post sem título',
            published_at: getField(['Date', 'Data']) || new Date().toISOString(),
            impressions: parseInt(getField(['Impressions', 'Impressões']) || 0),
            reactions: parseInt(getField(['Reactions', 'Reações', 'Likes']) || 0),
            comments: parseInt(getField(['Comments', 'Comentários']) || 0),
            shares: parseInt(getField(['Shares', 'Compartilhamentos', 'Reposts']) || 0),
            engagement_rate: parseFloat(getField(['Engagement rate', 'Taxa de engajamento']) || 0).toFixed(2),
            post_id: getField(['Post link', 'URL da publicação', 'ID']) || ''
        };
    },

    /**
     * Saves imported data to Supabase
     */
    async saveImportedData(userId, fileName, fileSize, metrics) {
        try {
            // 1. Log the import
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

            if (logError) throw logError;

            // 2. Insert metrics
            const metricsToInsert = metrics.map(m => ({
                ...m,
                user_id: userId,
                source_file_id: logData.id
            }));

            const { error: metricsError } = await supabase
                .from('metrics_history')
                .insert(metricsToInsert);

            if (metricsError) throw metricsError;

            return { success: true, count: metrics.length };
        } catch (error) {
            console.error('Error saving imported data:', error);
            return { success: false, error: error.message };
        }
    }
};
