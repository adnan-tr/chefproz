import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  Download,
  Filter,
  Grid,
  List,
  Save,

  FileImage,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Copy
} from 'lucide-react';
import { dbService, supabase } from '@/lib/supabase';

const ImageManagerPage: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replacingImage, setReplacingImage] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    usage: '',
    url: '',
    size: '',
    dimensions: '',
    alt_text: ''
  });

  const predefinedCategories = [
    'Hero Images',
    'Product Images', 
    'About Images',
    'Banner Images',
    'Icon Images',
    'Background Images',
    'Logo Images',
    'Gallery Images'
  ];

  const predefinedUsages = [
    'Homepage Hero',
    'Product Showcase',
    'About Section',
    'Contact Page',
    'Navigation',
    'Footer',
    'Blog Posts',
    'Social Media',
    'Email Templates'
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  // Cleanup preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // File upload utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageDimensions = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(`${img.width}x${img.height}`);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG images.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
    }
    
    return { valid: true };
  };

  const uploadFileToSupabase = async (file: File, fileName: string): Promise<string> => {
    const { error } = await supabase.storage
      .from('ui-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('ui-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }
    
    if (errors.length > 0) {
      setUploadMessage(errors.join('\n'));
      setUploadStatus('error');
      return;
    }
    
    setSelectedFiles(validFiles);
    
    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  };

  const fetchImages = async () => {
    try {
      const data = await dbService.getUIImages();
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (selectedFiles.length === 0) {
      setUploadMessage('Please select at least one file to upload.');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const uploadedImages = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Update progress
        setUploadProgress(((i + 0.5) / selectedFiles.length) * 100);
        
        // Upload file to Supabase storage
        const publicUrl = await uploadFileToSupabase(file, fileName);
        
        // Get image dimensions
        const dimensions = await getImageDimensions(file);
        
        // Create image record in database
        const imageData = {
          name: formData.name || file.name,
          category: formData.category || 'Uncategorized',
          usage: formData.usage || '',
          url: publicUrl,
          size: formatFileSize(file.size),
          dimensions: dimensions,
          alt_text: formData.alt_text || file.name.replace(/\.[^/.]+$/, ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const data = await dbService.createUIImage(imageData);
        uploadedImages.push(data);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${uploadedImages.length} image(s)`);
      
      // Reset and refresh
      setTimeout(() => {
        fetchImages();
        setIsAddModalOpen(false);
        resetForm();
        setSelectedFiles([]);
        setPreviewUrls([]);
        setUploadStatus('idle');
        setUploadMessage('');
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceImage = async () => {
    if (!replacingImage || selectedFiles.length === 0) {
      setUploadMessage('Please select a file to replace the image.');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const file = selectedFiles[0];
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      setUploadProgress(25);
      
      // Upload new file to Supabase storage
      const publicUrl = await uploadFileToSupabase(file, fileName);
      
      setUploadProgress(50);
      
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      setUploadProgress(75);
      
      // Update image record in database
      const imageData = {
        url: publicUrl,
        size: formatFileSize(file.size),
        dimensions: dimensions,
        updated_at: new Date().toISOString()
      };

      await dbService.updateUIImage(replacingImage.id, imageData);
      
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage('Image replaced successfully!');
      
      // Reset and refresh
      setTimeout(() => {
        fetchImages();
        setIsReplaceModalOpen(false);
        setReplacingImage(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setUploadStatus('idle');
        setUploadMessage('');
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error replacing image:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to replace image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    try {
      const imageData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      await dbService.updateUIImage(editingImage.id, imageData);
      fetchImages();
      setEditingImage(null);
      resetForm();
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await dbService.deleteUIImage(id);
        fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      usage: '',
      url: '',
      size: '',
      dimensions: '',
      alt_text: ''
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openReplaceModal = (image: any) => {
    setReplacingImage(image);
    setIsReplaceModalOpen(true);
    resetForm();
  };

  const openEditModal = (image: any) => {
    setEditingImage(image);
    setFormData({
      name: image.name || '',
      category: image.category || '',
      usage: image.usage || '',
      url: image.url || '',
      size: image.size || '',
      dimensions: image.dimensions || '',
      alt_text: image.alt_text || ''
    });
  };

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setUploadMessage('URL copied to clipboard!');
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000);
    } catch (error) {
      setUploadMessage('Failed to copy URL');
      setUploadStatus('error');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000);
    }
  };

  const categories = Array.from(new Set(images.map(img => img.category).filter(Boolean)));

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      'Hero Images': 'bg-red-100 text-red-800',
      'Product Images': 'bg-blue-100 text-blue-800',
      'About Images': 'bg-green-100 text-green-800',
      'Banner Images': 'bg-purple-100 text-purple-800',
    };
    
    return variants[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.usage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Image Manager</h1>
            <p className="text-slate-600 text-lg">Loading images...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-2 truncate">Image Manager</h1>
          <p className="text-sm lg:text-lg text-slate-600">Manage UI images and assets across the platform</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Images</DialogTitle>
            </DialogHeader>
            
            {/* File Upload Area */}
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop images here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to select files (JPEG, PNG, GIF, WebP, SVG - Max 10MB each)
                </p>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Upload Status */}
              {uploadStatus !== 'idle' && (
                <div className={`p-4 rounded-lg ${
                  uploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  uploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {uploadStatus === 'uploading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                    <span className={`text-sm font-medium ${
                      uploadStatus === 'success' ? 'text-green-800' :
                      uploadStatus === 'error' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {uploadMessage}
                    </span>
                  </div>
                  {uploadStatus === 'uploading' && (
                    <Progress value={uploadProgress} className="mt-2" />
                  )}
                </div>
              )}

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="aspect-video rounded overflow-hidden mb-2 bg-gray-100">
                          <img
                            src={previewUrls[index]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Form */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Image Metadata (Applied to all selected images)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Image Name (Optional)</Label>
                      <Input
                        id="name"
                        placeholder="Leave empty to use filename"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="usage">Usage</Label>
                      <Select value={formData.usage} onValueChange={(value) => setFormData({...formData, usage: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select usage" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedUsages.map((usage) => (
                            <SelectItem key={usage} value={usage}>{usage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="alt_text">Alt Text (Optional)</Label>
                      <Input
                        id="alt_text"
                        placeholder="Leave empty to use filename"
                        value={formData.alt_text}
                        onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddImage} 
                disabled={selectedFiles.length === 0 || isUploading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Total Images</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">{images.length}</p>
              </div>
              <ImageIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Categories</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">{categories.length}</p>
              </div>
              <Filter className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">This Month</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {images.filter(img => {
                    const created = new Date(img.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Storage Used</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">2.4 GB</p>
              </div>
              <Download className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border-2 border-slate-200 min-w-0">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 sm:flex-none"
              >
                <Grid className="h-4 w-4" />
                <span className="ml-1 sm:hidden">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none"
              >
                <List className="h-4 w-4" />
                <span className="ml-1 sm:hidden">List</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200 min-w-0">
              <CardContent className="p-3 lg:p-4">
                <div className="aspect-video rounded-lg overflow-hidden mb-3 lg:mb-4 bg-slate-100">
                  <img
                    src={image.url || '/api/placeholder/300/200'}
                    alt={image.alt_text || image.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 truncate text-sm lg:text-base">{image.name}</h3>
                    <Badge className={`${getCategoryBadge(image.category)} text-xs flex-shrink-0`}>
                      {image.category}
                    </Badge>
                  </div>
                  <p className="text-xs lg:text-sm text-slate-600 truncate">{image.usage}</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className="truncate">{image.dimensions}</span>
                    <span className="flex-shrink-0">{image.size}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 lg:gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 min-w-0 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyImageUrl(image.url)}
                      title="Copy URL"
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openReplaceModal(image)}
                      title="Replace Image"
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(image)} className="text-xs">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 text-xs"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-slate-200 min-w-0">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {filteredImages.map((image) => (
                <div key={image.id} className="p-4 lg:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={image.url || '/api/placeholder/64/64'}
                        alt={image.alt_text || image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                        <h3 className="text-base lg:text-lg font-semibold text-slate-900 truncate">{image.name}</h3>
                        <Badge className={`${getCategoryBadge(image.category)} flex-shrink-0`}>
                          {image.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-sm text-slate-600">
                        <div className="min-w-0">
                          <span className="font-medium">Usage:</span> <span className="truncate">{image.usage}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium">Size:</span> <span className="truncate">{image.size}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium">Dimensions:</span> <span className="truncate">{image.dimensions}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium">Created:</span> <span className="truncate">{new Date(image.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 sm:flex-nowrap sm:flex-col lg:flex-row">
                      <Button size="sm" variant="outline" className="min-w-0 flex-1 sm:flex-none">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyImageUrl(image.url)}
                        title="Copy URL"
                        className="min-w-0 flex-1 sm:flex-none"
                      >
                        <Copy className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openReplaceModal(image)}
                        title="Replace Image"
                        className="min-w-0 flex-1 sm:flex-none"
                      >
                        <RefreshCw className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Replace</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(image)} className="min-w-0 flex-1 sm:flex-none">
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 min-w-0 flex-1 sm:flex-none"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredImages.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">No images match your current filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Replace Image Modal */}
      <Dialog open={isReplaceModalOpen} onOpenChange={setIsReplaceModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Replace Image</DialogTitle>
          </DialogHeader>
          
          {replacingImage && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Image:</h4>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                  <img
                    src={replacingImage.url}
                    alt={replacingImage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{replacingImage.name}</p>
                  <p className="text-sm text-gray-600">{replacingImage.dimensions} • {replacingImage.size}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* File Upload Area */}
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileImage className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select replacement image
              </h3>
              <p className="text-gray-600 mb-3">
                Drag and drop or click to select (JPEG, PNG, GIF, WebP, SVG - Max 10MB)
              </p>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <div className={`p-4 rounded-lg ${
                uploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
                uploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {uploadStatus === 'uploading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <span className={`text-sm font-medium ${
                    uploadStatus === 'success' ? 'text-green-800' :
                    uploadStatus === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {uploadMessage}
                  </span>
                </div>
                {uploadStatus === 'uploading' && (
                  <Progress value={uploadProgress} className="mt-2" />
                )}
              </div>
            )}

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">New Image Preview</h4>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                      <img
                        src={previewUrls[0]}
                        alt={selectedFiles[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{selectedFiles[0].name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(selectedFiles[0].size)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsReplaceModalOpen(false);
                setReplacingImage(null);
                resetForm();
              }} 
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReplaceImage} 
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Replacing...' : 'Replace Image'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Image Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-usage">Usage</Label>
              <Input
                id="edit-usage"
                value={formData.usage}
                onChange={(e) => setFormData({...formData, usage: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-size">File Size</Label>
              <Input
                id="edit-size"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-dimensions">Dimensions</Label>
              <Input
                id="edit-dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-alt_text">Alt Text</Label>
              <Input
                id="edit-alt_text"
                value={formData.alt_text}
                onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-url">Image URL</Label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateImage}>
              <Save className="h-4 w-4 mr-2" />
              Update Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageManagerPage;