import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import './ImportModal.css';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        const isValidFile = droppedFile && (
            droppedFile.name.endsWith('.csv') ||
            droppedFile.name.endsWith('.xlsx') ||
            droppedFile.name.endsWith('.xls')
        );

        if (isValidFile) {
            setFile(droppedFile);
            setStatus('idle');
        } else {
            setErrorMessage('Por favor, selecione um arquivo CSV ou Excel do LinkedIn.');
            setStatus('error');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('processing');

        try {
            const reader = new FileReader();
            const extension = file.name.split('.').pop().toLowerCase();
            const isExcel = extension === 'xlsx' || extension === 'xls';

            reader.onload = async (e) => {
                const content = e.target.result;
                await onImportSuccess(file, content);
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setFile(null);
                    setStatus('idle');
                }, 2000);
            };

            reader.onerror = () => {
                throw new Error('Erro ao ler o arquivo.');
            };

            if (isExcel) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        } catch (error) {
            setErrorMessage(error.message);
            setStatus('error');
        }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <h2>Importar Dados do LinkedIn</h2>
                    <p>Suba o relatório CSV ou Excel de "Publicações" para atualizar seu dashboard.</p>
                </div>

                <div className="modal-body">
                    {status === 'success' ? (
                        <div className="status-view success">
                            <CheckCircle2 size={48} className="status-icon" />
                            <h3>Importação Concluída!</h3>
                            <p>Seus dados reais já foram processados e os gráficos estão sendo atualizados.</p>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".csv, .xlsx, .xls"
                                    style={{ display: 'none' }}
                                />

                                {file ? (
                                    <div className="file-info">
                                        <FileText size={40} className="file-icon" />
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}>Trocar arquivo</Button>
                                    </div>
                                ) : (
                                    <div className="dropzone-prompt">
                                        <Upload size={40} className="upload-icon" />
                                        <p>Arraste o relatório CSV ou Excel aqui ou clique para buscar</p>
                                        <span className="hint">Arquivos .csv ou .xlsx gerados pelo LinkedIn</span>
                                    </div>
                                )}
                            </div>

                            {status === 'error' && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="modal-actions">
                                <Button variant="secondary" onClick={onClose} disabled={status === 'processing'}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleUpload}
                                    disabled={!file || status === 'processing'}
                                    isLoading={status === 'processing'}
                                >
                                    Confirmar Importação
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
