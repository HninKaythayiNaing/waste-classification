import { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertCircle, Loader2, RotateCcw, Leaf, Upload, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import WasteImageUploader from '@/components/WasteImageUploader';
import CameraCapture from '@/components/CameraCapture';
import ClassificationResultCard from '@/components/ClassificationResultCard';
import Layout from '@/components/Layout';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState({});
  const [captureMode, setCaptureMode] = useState('upload');

  useEffect(() => {
    base44.entities.WasteCategory.list().then(cats => {
      const map = {};
      cats.forEach(c => { map[c.slug] = c; });
      setCategories(map);
    }).catch(() => {});
  }, []);

  const [cameraPreviewUrl, setCameraPreviewUrl] = useState(null);

  const handleImageUploaded = useCallback((file, errMsg) => {
    if (errMsg) {
      setError(errMsg);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    setResult(null);
    setCategory(null);
  }, []);

  const handleCameraCapture = useCallback((file) => {
    setError(null);
    setSelectedFile(file);
    setCameraPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setCategory(null);
  }, []);

  const handleClassify = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setResponseTime(null);
    const startTime = Date.now();

    try {
      // Step 1: Upload the image
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      setImagePreviewUrl(file_url);

      // Step 2: Classify with AI vision
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a waste classification expert. Analyze the uploaded image and classify the waste item into exactly one of these categories: Plastic, Paper, Glass, Metal, Organic Waste, or Electronic Waste.

Provide:
1. The predicted category (must be one of the exact category names above)
2. A confidence score between 0 and 1
3. A brief description of the specific item identified
4. Practical recycling instructions for this specific item
5. 3-5 disposal tips specific to this item
6. The environmental impact of this type of waste

If the image does not contain a waste item, set confidence to 0 and explain in item_description.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            predicted_category: { type: 'string', enum: ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic Waste', 'Electronic Waste'] },
            confidence: { type: 'number' },
            item_description: { type: 'string' },
            recycling_instructions: { type: 'string' },
            disposal_tips: { type: 'array', items: { type: 'string' } },
            environmental_impact: { type: 'string' }
          },
          required: ['predicted_category', 'confidence', 'item_description', 'recycling_instructions', 'disposal_tips', 'environmental_impact']
        }
      });

      // Step 3: Match category slug
      const slugMap = {
        'Plastic': 'plastic',
        'Paper': 'paper',
        'Glass': 'glass',
        'Metal': 'metal',
        'Organic Waste': 'organic',
        'Electronic Waste': 'electronic'
      };
      const slug = slugMap[llmResult.predicted_category] || 'plastic';
      const matchedCategory = categories[slug];

      setResult(llmResult);
      setCategory(matchedCategory);
      setResponseTime(Date.now() - startTime);

      // Step 4: Save classification record
      await base44.entities.ClassificationRecord.create({
        image_url: file_url,
        predicted_category: llmResult.predicted_category,
        category_slug: slug,
        confidence: llmResult.confidence,
        item_description: llmResult.item_description,
        recycling_instructions: llmResult.recycling_instructions,
        disposal_tips: llmResult.disposal_tips,
        environmental_impact: llmResult.environmental_impact,
        response_time_ms: Date.now() - startTime
      });
    } catch (err) {
      setError(err.message || 'Failed to classify the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setCameraPreviewUrl(null);
    setResult(null);
    setCategory(null);
    setError(null);
    setResponseTime(null);
  };

  return (
    <Layout>
    <div className="min-h-screen bg-stone-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-widest opacity-80">AI-Powered Waste Classifier</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold leading-tight mb-2">
            Snap it, Sort it
          </h1>
          <p className="text-emerald-50/90 text-xs font-medium mb-1">Save the planet, one item at a time.</p>
          <p className="text-emerald-50/90 text-sm md:text-base max-w-lg">
            Upload a photo of any waste item and get instant AI classification with recycling recommendations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-800 mb-1">Waste Image</h2>
              <p className="text-xs text-stone-400 mb-4">Take a real-time photo or upload an image of the waste item</p>

              <div className="flex gap-1 mb-4 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setCaptureMode('upload')}
                  disabled={!!selectedFile}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    captureMode === 'upload' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
                <button
                  onClick={() => setCaptureMode('camera')}
                  disabled={!!selectedFile}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    captureMode === 'camera' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Camera
                </button>
              </div>

              {captureMode === 'upload' ? (
                <WasteImageUploader
                  onImageUploaded={handleImageUploaded}
                  uploading={analyzing}
                  disabled={!!result}
                />
              ) : cameraPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img src={cameraPreviewUrl} alt="Captured waste" className="w-full max-h-80 object-contain" />
                  {!analyzing && !result && (
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  {analyzing && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Analyzing image…</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CameraCapture onCapture={handleCameraCapture} disabled={analyzing} />
              )}
              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleClassify}
                  disabled={!selectedFile || analyzing || !!result}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Classify Waste
                    </>
                  )}
                </button>
                {(result || selectedFile) && (
                  <button
                    onClick={handleReset}
                    disabled={analyzing}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New
                  </button>
                )}
              </div>
            </div>

            {imagePreviewUrl && result && (
              <div className="bg-white rounded-2xl border border-stone-200 p-3">
                <img src={imagePreviewUrl} alt="Analyzed waste" className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Result panel */}
          <div>
            {result ? (
              <ClassificationResultCard result={result} category={category} responseTime={responseTime} />
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-stone-300" />
                </div>
                <h3 className="font-semibold text-stone-700 mb-1">Results appear here</h3>
                <p className="text-sm text-stone-400 max-w-xs">
                  Upload an image and tap classify to see the waste category, recycling instructions, and environmental impact.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}