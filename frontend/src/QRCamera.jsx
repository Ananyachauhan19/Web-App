import { useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

export default function QRCamera() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [scanning, setScanning] = useState(false);
  const [galleryImage, setGalleryImage] = useState(null);

  const handleQRResult = async (qrText, codeReader) => {
    setResult(qrText);
    setStatus('Sending to backend...');
    setScanning(true);
    try {
      const res = await fetch('https://web-app-npyk.onrender.com/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId: qrText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('✅ Row highlighted in sheet!');
      } else {
            setStatus(`❌ Error: ${data.message || 'Failed to highlight row'}`);
      }
    } catch (err) {
          setStatus(`❌ Error: ${err.message || 'Failed to connect to backend'}`);
    } finally {
      setScanning(false);
      if (codeReader && typeof codeReader.reset === 'function') codeReader.reset();
    }
  };

  const startScan = async () => {
    setStatus('Starting camera...');
    setScanning(true);
    setGalleryImage(null);
    const codeReader = new BrowserQRCodeReader();
    try {
      const result = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (res, err, controls) => {
          if (res) {
            setStatus('QR code found: ' + res.getText());
            controls.stop();
            handleQRResult(res.getText(), codeReader);
          } else if (err && err.name !== 'NotFoundException') {
            setStatus('Error: ' + err.message);
          } else {
            setStatus('Scanning live...');
          }
        }
      );
    } catch (err) {
      setStatus('❌ Error: ' + (err.message || 'Failed to start camera'));
      setScanning(false);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setStatus('Processing image...');
      setScanning(true);
      setGalleryImage(URL.createObjectURL(file));
      try {
        const codeReader = new BrowserQRCodeReader();
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const result = await codeReader.decodeFromImageElement(img);
            setStatus('QR code found: ' + result.getText());
            handleQRResult(result.getText(), codeReader);
          } catch (err) {
            setStatus('❌ Error: ' + (err.message || 'No QR code found in image'));
            setScanning(false);
          }
        };
      } catch (err) {
        setStatus('❌ Error: ' + (err.message || 'Failed to process image'));
        setScanning(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-900">
      {/* IEEE Header Banner */}
      <header className="w-full bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 border-b-4 border-slate-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* IEEE Logo and Title Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
            <div className="flex items-center gap-6 mb-6 lg:mb-0">
              <div className="flex-shrink-0 bg-white rounded-2xl p-2 sm:p-3 shadow-xl border-4 border-slate-300 flex items-center justify-center" style={{ minWidth: '64px', minHeight: '48px', maxWidth: '120px', maxHeight: '80px' }}>
                {/* IEEE SB GEHU Official Logo */}
                <img 
                  src="/assets/IEEE.png" 
                  alt="IEEE SB GEHU Logo" 
                  className="w-full h-full max-w-[100px] max-h-[60px] object-contain"
                  style={{ display: 'block', margin: '0 auto' }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">IEEE SB GEHU</h1>
                <p className="text-blue-100 text-sm lg:text-base font-medium">Student Branch - Graphic Era Hill University</p>
                <p className="text-blue-200 text-xs lg:text-sm">Advancing Technology for Humanity</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-blue-100">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">2025</div>
                <div className="text-xs lg:text-sm">Est. Chapter</div>
              </div>
              <div className="w-px h-12 bg-blue-500"></div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">500+</div>
                <div className="text-xs lg:text-sm">Members</div>
              </div>
            </div>
          </div>

          {/* Workshop Announcement */}
          <div className="bg-gradient-to-r from-blue-800/80 to-indigo-800/80 rounded-2xl p-6 lg:p-8 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">technIEEEks' 25</h2>
                <p className="text-blue-100 text-lg lg:text-xl font-semibold mb-2">Workshop on Research Papers & Journals</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    29th August 2025
                  </span>
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Research Workshop</span>
                </div>
                <p className="text-blue-50 text-base lg:text-lg leading-relaxed mb-4">
                  Want your name in a journal instead of just your notebook? From scribbles to citations, learn how to structure impactful research papers, crack the publishing process, and explore reputed journals—guided by our expert faculty.
                </p>
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-300/20">
                  <p className="text-blue-100 font-bold text-lg italic text-center">
                    "Don't just read the knowledge - Create it."
                  </p>
                </div>
              </div>
            </div>
            
            {/* IEEE Values */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-blue-400/20">
              <div className="flex items-center gap-2 text-blue-200">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="font-semibold">Innovation</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                <span className="font-semibold">Excellence</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">Research</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="font-semibold">Collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* QR Scanner Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">QR Code Scanner</h2>
          <p className="text-xl text-blue-200 mb-2">Professional Document Tracking System</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-blue-500/30 shadow-2xl">
          {/* Scanner Display */}
          <div className="relative mb-8">
            <div className="w-full aspect-video bg-slate-900/80 rounded-2xl border-2 border-blue-500/40 overflow-hidden relative shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: scanning && !galleryImage ? 'block' : 'none' }}
              />
              
              {galleryImage && (
                <img 
                  src={galleryImage} 
                  alt="QR from gallery" 
                  className="w-full h-full object-contain" 
                />
              )}
              
              {!scanning && !galleryImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 border-3 border-dashed border-blue-400/60 bg-blue-900/30 rounded-3xl flex items-center justify-center">
                      <svg className="w-12 h-12 lg:w-16 lg:h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m-4-4h.01M8 12h.01M8 12v.01" />
                      </svg>
                    </div>
                    <p className="text-blue-200 text-lg font-medium">Position QR code within frame</p>
                    <p className="text-blue-300 text-sm mt-1">Camera ready for scanning</p>
                  </div>
                </div>
              )}
              
              {scanning && !galleryImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-ping border-4 border-blue-400/70 rounded-2xl w-48 h-48 lg:w-56 lg:h-56 absolute"></div>
                    <div className="border-4 border-blue-500 rounded-2xl w-48 h-48 lg:w-56 lg:h-56"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <p className="text-blue-100 text-lg lg:text-xl font-medium mb-2">
              IEEE Document Tracking System
            </p>
            <p className="text-blue-300 text-base">
              Scan QR codes using your camera or upload an image from your gallery
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={startScan} 
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg border border-blue-400/30"
              disabled={scanning && !galleryImage}
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {scanning && !galleryImage ? 'Scanning Active...' : 'Start Camera Scan'}
            </button>
            
            <button 
              onClick={handleGalleryClick} 
              className="group px-8 py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-slate-950 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg border border-blue-400/20"
              disabled={scanning && !galleryImage}
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload from Gallery
            </button>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Status Display */}
          <div className="bg-slate-900/60 rounded-2xl p-6 mb-6 border border-blue-500/30 shadow-inner">
            <div className="text-center">
              <h3 className="text-blue-200 font-semibold text-lg mb-2">System Status</h3>
              <div className="text-blue-100 font-medium flex items-center justify-center gap-3 text-lg min-h-[2rem]">
                {status && (
                  <div className="flex items-center gap-3">
                    {scanning && !galleryImage && (
                      <div className="animate-spin w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full"></div>
                    )}
                    <span className="break-words">{status}</span>
                  </div>
                )}
                {!status && (
                  <div className="flex items-center gap-2 text-blue-300">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>System ready - Waiting for QR code input</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-400/40 rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <h3 className="text-blue-100 font-bold text-xl mb-4 flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scan Results
                </h3>
                <div className="bg-slate-900/70 rounded-xl p-6 border border-blue-300/20">
                  <p className="text-blue-50 break-all font-mono text-base lg:text-lg leading-relaxed">
                    {result}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* IEEE Footer */}
      <footer className="bg-slate-900/90 border-t border-blue-500/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.9 5.16-1.16 9-5.35 9-10.9V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">IEEE SB GEHU</p>
                <p className="text-blue-300 text-sm">Advancing Technology for Humanity</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-blue-300 text-sm">
              <span>Secure</span>
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span>Reliable</span>
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span>Professional</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}