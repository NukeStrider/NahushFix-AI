import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import Editor from './components/Editor';
import { ImageFile } from './types';
import { SparklesIcon } from './components/icons';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getImageAspectRatio = (dataUrl: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
        img.onerror = (err) => {
            console.error("Failed to load image to determine aspect ratio.");
            resolve(1); // Fallback aspect ratio
        };
        img.src = dataUrl;
    });
};

const ThumbnailGallery: React.FC<{
    images: ImageFile[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}> = ({ images, onSelect, onDelete, onClear }) => (
  <div className="w-full mt-8 fade-in">
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white/80">Your Photos</h2>
        <button onClick={onClear} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Clear All</button>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4 bg-black/20 rounded-lg">
      {images.map(image => (
        <div key={image.id} className="relative group aspect-square">
          <img 
            src={image.previewUrl}
            alt="User upload thumbnail"
            className="w-full h-full object-cover rounded-lg cursor-pointer transition-transform duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-cyan-400"
            onClick={() => onSelect(image.id)}
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(image.id); }} 
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
            aria-label="Delete image"
          >
            <span className="font-bold leading-none -mt-0.5">&times;</span>
          </button>
        </div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);

  const handleUpload = async (files: FileList) => {
    const newImageFilesPromises = Array.from(files).map(async (file) => {
      try {
        const dataUrl = await fileToDataUrl(file);
        const aspectRatio = await getImageAspectRatio(dataUrl);
        const newImageFile: ImageFile = {
          id: `${new Date().toISOString()}-${file.name}`,
          file: file,
          previewUrl: dataUrl,
          history: [dataUrl],
          aspectRatio: aspectRatio,
        };
        return newImageFile;
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        return null;
      }
    });
    
    const newImageFiles = (await Promise.all(newImageFilesPromises)).filter(Boolean) as ImageFile[];
    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  const handleUpdateImage = (updatedImage: ImageFile) => {
    setImageFiles(prevFiles =>
      prevFiles.map(file => (file.id === updatedImage.id ? updatedImage : file))
    );
  };

  const handleDeleteImage = (id: string) => {
    setImageFiles(prev => prev.filter(img => img.id !== id));
  };
  
  const handleClearAll = () => {
    setImageFiles([]);
    setSelectedImageId(null);
  };

  const handleBack = () => {
    setSelectedImageId(null);
  };

  const selectedImage = imageFiles.find(img => img.id === selectedImageId);

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans flex flex-col">
      <header className="py-4 px-8 border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center">
            <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3"/>
            <h1 className="text-2xl font-bold tracking-tighter">NahushFix AI</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center w-full p-4">
        {isApiKeyMissing ? (
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-8 rounded-lg max-w-2xl text-center">
                <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
                <p>The API Key is missing from the environment settings. This application cannot connect to the AI service without it.</p>
                <p className="mt-4">Please ensure the API key is set up correctly in the platform's secret or environment variable settings and then refresh the page.</p>
            </div>
        ) : selectedImage ? (
          <Editor image={selectedImage} setImageFile={handleUpdateImage} onBack={handleBack} />
        ) : (
          <div className="w-full max-w-4xl mx-auto text-center">
            <ImageUploader onUpload={handleUpload} />
            {imageFiles.length > 0 && (
                <ThumbnailGallery 
                    images={imageFiles} 
                    onSelect={setSelectedImageId}
                    onDelete={handleDeleteImage}
                    onClear={handleClearAll}
                />
            )}
          </div>
        )}
      </main>

      <footer className="py-4 px-8 text-center text-white/40 text-sm border-t border-white/10 flex-shrink-0">
        <p>A Nahush Shrivastava Creation</p>
      </footer>
    </div>
  );
};

export default App;