import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, UploadCloud, Loader2, FileImage, CheckCircle, AlertCircle, Camera, X, ImagePlus } from 'lucide-react';
import { openaiService, ExtractedDFDData } from '@/services/openaiService';

interface DFDImportModalProps {
  open: boolean;
  onClose: () => void;
  onExtracted: (data: ExtractedDFDData) => void;
}

const DFDImportModal = ({ open, onClose, onExtracted }: DFDImportModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle closing streams on unmount or tab switch
  useEffect(() => {
    if (!open) {
      stopCamera();
      setFiles([]);
      setStatus('idle');
      setMode('upload');
    }
    return () => stopCamera();
  }, [open, mode]);

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Permissão da câmera negada ou dispositivo não encontrado.');
      toast({
        title: "Câmera bloqueada",
        description: "Permita o acesso à câmera no seu navegador.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
       videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFiles(prev => [...prev, capturedFile]);
            toast({ title: "Foto capturada", description: "Página adicionada ao DFD." });
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
      
      if (validFiles.length !== selectedFiles.length) {
         toast({ title: "Formato inválido ignorado", description: "Apenas imagens (JPG/PNG) foram adicionadas." });
      }
      setFiles(prev => [...prev, ...validFiles]);
      setStatus('idle');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleExtract = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);
      setStatus('processing');
      stopCamera();

      // Convert all files to base64
      const base64Array = await Promise.all(files.map(f => fileToBase64(f)));
      
      const extractedData = await openaiService.extractDFDFromImage(base64Array);
      
      setStatus('success');
      toast({
        title: "Sucesso!",
        description: "Os dados do DFD foram extraídos da inteligência com sucesso.",
      });

      setTimeout(() => {
        onExtracted(extractedData);
        onClose();
      }, 1200);

    } catch (error) {
      setStatus('error');
      toast({
        title: "Erro na leitura",
        description: "Não foi possível extrair dados das imagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-xl border-none shadow-2xl rounded-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <ScanLine className="mr-3 text-indigo-200" size={28} />
              Digitalização Inteligente de DFD
            </DialogTitle>
            <DialogDescription className="text-indigo-100 font-medium mt-1">
              Faça upload de múltiplas fotos ou escaneie o documento físico pela câmera. A IA compilará as páginas em um único rascunho.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 flex flex-col h-full max-h-[70vh] overflow-y-auto">
          {status === 'idle' && (
            <>
              {/* Tabs for Mode */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-6 shrink-0">
                <button 
                  onClick={() => { setMode('upload'); stopCamera(); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Fazer Upload
                </button>
                <button 
                  onClick={() => { setMode('camera'); startCamera(); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'camera' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Usar Câmera
                </button>
              </div>

              {/* Upload UI */}
              {mode === 'upload' && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group shrink-0"
                >
                  <input 
                    type="file" 
                    multiple
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                  />
                  <ImagePlus size={42} className="text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" />
                  <p className="text-gray-700 font-semibold text-center mb-1">Adicionar páginas / fotos (JPG, PNG)</p>
                  <p className="text-gray-500 text-sm text-center">Pode adicionar vários arquivos de uma vez</p>
                </div>
              )}

              {/* Camera UI */}
              {mode === 'camera' && (
                <div className="flex flex-col items-center bg-gray-900 rounded-xl overflow-hidden relative min-h-[250px] shrink-0">
                   {!cameraActive && !cameraError && (
                     <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Loader2 className="animate-spin" />
                     </div>
                   )}
                   {cameraError && (
                     <div className="absolute inset-0 flex items-center justify-center text-red-400 p-6 text-center text-sm font-semibold">
                       {cameraError}
                     </div>
                   )}
                   <video 
                     ref={videoRef} 
                     className="w-full max-h-[300px] object-cover" 
                     playsInline 
                     autoPlay 
                     muted
                   />
                   <canvas ref={canvasRef} className="hidden" />
                   
                   {cameraActive && (
                     <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/40 border-4 border-white shadow-xl backdrop-blur-md flex items-center justify-center p-0">
                          <Camera className="text-white drop-shadow-md" size={24} />
                        </Button>
                     </div>
                   )}
                </div>
              )}

              {/* Files List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 block">Documentos Anexados ({files.length})</h4>
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-2.5 rounded-lg group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center shrink-0">
                            <FileImage size={18} />
                          </div>
                          <div className="truncate pr-4">
                            <p className="text-xs font-semibold text-gray-800 truncate">{f.name}</p>
                            <p className="text-[10px] text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                           <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Status indicators */}
          {(status === 'processing' || status === 'success' || status === 'error') && (
            <div className="py-12 flex flex-col items-center justify-center h-full">
              {status === 'processing' && (
                <div className="flex flex-col items-center animate-pulse text-center">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                    <p className="text-base font-bold text-indigo-700">Lendo {files.length} página(s)...</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">Nossa Inteligência Artificial está extraindo os itens e cruzando referências do DFD.</p>
                </div>
              )}
              {status === 'success' && (
                <div className="flex flex-col items-center text-center">
                    <CheckCircle className="text-green-500 mb-3" size={48} />
                    <p className="text-base font-bold text-green-700">Extração Concluída!</p>
                    <p className="text-sm text-gray-500 mt-1">Montando rascunho na tela...</p>
                </div>
              )}
              {status === 'error' && (
                <div className="flex flex-col items-center text-center">
                    <AlertCircle className="text-red-500 mb-3" size={48} />
                    <p className="text-base font-bold text-red-700">Falha na Leitura</p>
                    <p className="text-sm text-gray-500 mt-1">As imagens estavam legíveis?</p>
                    <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>Tentar Novamente</Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100 shrink-0">
              <Button variant="ghost" onClick={onClose} disabled={loading} className="text-gray-600 hover:bg-gray-100">
                Cancelar
              </Button>
              <Button 
                onClick={handleExtract} 
                disabled={files.length === 0 || loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-6 font-semibold"
              >
                Escanear Páginas ({files.length})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DFDImportModal;
