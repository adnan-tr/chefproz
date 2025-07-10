import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Edit, 
  Save, 
  X,
  Upload,
  Download,
  Globe,
  Check
} from 'lucide-react';
import { dbService, supabase } from '@/lib/supabase';

const TranslationsPage: React.FC = () => {
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    en: '',
    ar: '',
    tr: '',
    es: '',
    ru: ''
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  useEffect(() => {
    fetchTranslations();
    initializeWebsiteTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('key', { ascending: true });
      
      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeWebsiteTranslations = async () => {
    const commonTranslations = [
      { key: 'nav.home', en: 'Home', ar: 'الرئيسية', tr: 'Ana Sayfa', es: 'Inicio', ru: 'Главная' },
      { key: 'nav.about', en: 'About', ar: 'حولنا', tr: 'Hakkımızda', es: 'Acerca de', ru: 'О нас' },
      { key: 'nav.contact', en: 'Contact Us', ar: 'اتصل بنا', tr: 'İletişim', es: 'Contacto', ru: 'Контакты' }
    ];

    for (const translation of commonTranslations) {
      try {
        const { data: existing, error } = await supabase
          .from('translations')
          .select('*')
          .eq('key', translation.key)
          .single();

        if (!existing) {
          await supabase
            .from('translations')
            .insert({
              key: translation.key,
              en: translation.en,
              ar: translation.ar,
              tr: translation.tr,
              es: translation.es,
              ru: translation.ru
            });
        }
      } catch (error) {
        await supabase
          .from('translations')
          .insert({
            key: translation.key,
            en: translation.en,
            ar: translation.ar,
            tr: translation.tr,
            es: translation.es,
            ru: translation.ru
          });
      }
    }
  };

  const handleEdit = (key: string, translations: any) => {
    setEditingKey(key);
    const values: Record<string, string> = {};
    languages.forEach(lang => {
      values[lang.code] = translations[lang.code] || '';
    });
    setEditingValues(values);
  };

  const handleSave = async () => {
    if (!editingKey) return;

    try {
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('key', editingKey)
        .single();

      const translationData = {
        key: editingKey,
        en: editingValues.en || '',
        ar: editingValues.ar || '',
        tr: editingValues.tr || '',
        es: editingValues.es || '',
        ru: editingValues.ru || ''
      };

      if (existing) {
        await supabase
          .from('translations')
          .update(translationData)
          .eq('key', editingKey);
      } else {
        await supabase
          .from('translations')
          .insert(translationData);
      }

      setEditingKey(null);
      setEditingValues({});
      fetchTranslations();
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditingValues({});
  };

  const handleValueChange = (langCode: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [langCode]: value
    }));
  };

  const handleAddTranslation = async () => {
    try {
      await supabase
        .from('translations')
        .insert({
          key: newTranslation.key,
          en: newTranslation.en || '',
          ar: newTranslation.ar || '',
          tr: newTranslation.tr || '',
          es: newTranslation.es || '',
          ru: newTranslation.ru || ''
        });

      fetchTranslations();
      setIsAddModalOpen(false);
      setNewTranslation({
        key: '',
        en: '',
        ar: '',
        tr: '',
        es: '',
        ru: ''
      });
    } catch (error) {
      console.error('Error adding translation:', error);
    }
  };

  const filteredTranslations = translations.filter(translation =>
    translation.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Translations</h1>
            <p className="text-gray-600">Loading translations...</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">Translations</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage multilingual content across the platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Translation</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Translation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-key">Translation Key</Label>
                  <Input
                    id="new-key"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({...newTranslation, key: e.target.value})}
                    placeholder="e.g., nav.new_item"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {languages.map((lang) => (
                    <div key={lang.code}>
                      <Label className="flex items-center text-sm font-medium text-gray-700">
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </Label>
                      <Input
                        value={newTranslation[lang.code as keyof typeof newTranslation]}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          [lang.code]: e.target.value
                        })}
                        placeholder={`Enter ${lang.name} translation...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddTranslation} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Add Translation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center text-base lg:text-lg">
            <Globe className="h-4 w-4 lg:h-5 lg:w-5 mr-2 flex-shrink-0" />
            <span className="truncate">Supported Languages</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {languages.map((lang) => (
              <Badge key={lang.code} variant="outline" className="px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm">
                <span className="mr-1 lg:mr-2">{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name} ({lang.code})</span>
                <span className="sm:hidden">{lang.code}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardContent className="p-4 lg:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search translation keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg truncate">Translation Keys ({filteredTranslations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            {filteredTranslations.map((translation) => (
              <div key={translation.key} className="border rounded-lg p-3 lg:p-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate text-sm lg:text-base">{translation.key}</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Translation key identifier</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    {editingKey === translation.key ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Save</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                          <X className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Cancel</span>
                          <span className="sm:hidden">Cancel</span>
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(translation.key, translation)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                  {languages.map((lang) => (
                    <div key={lang.code} className="space-y-2 min-w-0">
                      <label className="flex items-center text-xs lg:text-sm font-medium text-gray-700">
                        <span className="mr-1 lg:mr-2 flex-shrink-0">{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </label>
                      {editingKey === translation.key ? (
                        <Textarea
                          value={editingValues[lang.code] || ''}
                          onChange={(e) => handleValueChange(lang.code, e.target.value)}
                          className="min-h-[60px] lg:min-h-[80px] text-xs lg:text-sm"
                          placeholder={`Enter ${lang.name} translation...`}
                        />
                      ) : (
                        <div className="p-2 lg:p-3 bg-gray-50 rounded-md min-h-[60px] lg:min-h-[80px] text-xs lg:text-sm overflow-hidden">
                          {translation[lang.code] ? (
                            <span className="break-words">{translation[lang.code]}</span>
                          ) : (
                            <span className="text-gray-400 italic">No translation</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationsPage;