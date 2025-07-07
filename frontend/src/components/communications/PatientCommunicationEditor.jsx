import { useState } from 'react'
import { motion } from 'framer-motion'
import { Languages, Eye, Save, Send, BarChart3, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PatientCommunicationEditor({ patientId }) {
  const [content, setContent] = useState(`Dear [Patient Name],

I hope this letter finds you in good health. I wanted to take a moment to update you on your recent test results and discuss our next steps in your treatment plan.

## Test Results Summary

Your recent imaging studies show that the treatment is working well. The tumor has decreased in size by approximately 30% compared to your baseline scan. This is an encouraging response that indicates the current therapy is effective.

## What This Means

This positive response means:
- The cancer is responding well to treatment
- We are on the right track with your current therapy
- Your prognosis continues to be favorable

## Next Steps

Moving forward, we will:
1. Continue with your current treatment schedule
2. Monitor your progress with regular check-ups
3. Adjust the plan if needed based on how you're feeling

## Important Reminders

Please remember to:
- Take your medications as prescribed
- Keep all scheduled appointments
- Contact us immediately if you have any concerns
- Maintain a healthy diet and get adequate rest

If you have any questions or concerns, please don't hesitate to reach out to our team. We are here to support you every step of the way.

Warm regards,
Dr. [Doctor Name]`)

  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [readingLevel, setReadingLevel] = useState(8)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ]

  const getReadingLevelColor = (level) => {
    if (level <= 6) return 'bg-sage/20 text-sage'
    if (level <= 9) return 'bg-saffron/20 text-saffron'
    return 'bg-clay/20 text-clay'
  }

  const getReadingLevelLabel = (level) => {
    if (level <= 6) return 'Easy to read'
    if (level <= 9) return 'Moderately complex'
    return 'Complex'
  }

  // Mock translation function
  const getTranslatedContent = (langCode) => {
    if (langCode === 'en') return content
    
    const translations = {
      es: `Estimado/a [Nombre del Paciente],

Espero que esta carta lo/la encuentre con buena salud. Quería tomarme un momento para actualizarlo/la sobre sus resultados de pruebas recientes y discutir nuestros próximos pasos en su plan de tratamiento.

## Resumen de Resultados de Pruebas

Sus estudios de imágenes recientes muestran que el tratamiento está funcionando bien. El tumor ha disminuido de tamaño aproximadamente un 30% comparado con su exploración inicial...`,
      
      fr: `Cher/Chère [Nom du Patient],

J'espère que cette lettre vous trouve en bonne santé. Je voulais prendre un moment pour vous informer de vos récents résultats de tests et discuter de nos prochaines étapes dans votre plan de traitement.

## Résumé des Résultats de Tests

Vos études d'imagerie récentes montrent que le traitement fonctionne bien. La tumeur a diminué de taille d'environ 30% par rapport à votre scan de référence...`,
      
      ar: `عزيزي/عزيزتي [اسم المريض],

أتمنى أن تجدك/تجدك هذه الرسالة في صحة جيدة. أردت أن آخذ لحظة لأطلعك على نتائج فحوصاتك الأخيرة ومناقشة خطواتنا التالية في خطة علاجك.

## ملخص نتائج الفحوصات

دراسات التصوير الأخيرة تظهر أن العلاج يعمل بشكل جيد. لقد انخفض حجم الورم بنسبة 30% تقريباً مقارنة بالفحص الأساسي...`,
      
      zh: `亲爱的[患者姓名]，

希望这封信发现您身体健康。我想花一点时间向您更新最近的检查结果，并讨论我们治疗计划的下一步。

## 检查结果摘要

您最近的影像学检查显示治疗效果良好。与基线扫描相比，肿瘤大小减少了约30%...`
    }
    
    return translations[langCode] || content
  }

  const handleSave = () => {
    console.log('Saving communication...', { content, language: selectedLanguage, readingLevel })
  }

  const handleSend = () => {
    console.log('Sending communication...', { content, language: selectedLanguage })
  }

  return (
    <div className="space-y-4">
      {/* Reading Level Indicator */}
      <Card className="bg-parchment border-almond">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cacao/60" />
              <span className="text-sm text-cacao/70">Reading Level Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getReadingLevelColor(readingLevel)} flex items-center gap-1`}>
                Grade {readingLevel}
              </Badge>
              <span className="text-xs text-cacao/60">{getReadingLevelLabel(readingLevel)}</span>
            </div>
          </div>
          <div className="mt-2 w-full bg-almond rounded-full h-2">
            <div 
              className="bg-sage h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (12 - readingLevel) * 10)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor and Preview */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card className="bg-parchment border-almond">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-cacao">
                  Patient Communication Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="h-3 w-3 mr-1" />
                    Save Draft
                  </Button>
                  <Button size="sm" onClick={handleSend} className="bg-sage hover:bg-sage/90">
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your patient communication here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {/* Language Selection */}
          <Card className="bg-parchment border-almond">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Multilingual Preview
                </CardTitle>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview Content */}
                <div 
                  className={`p-4 bg-white border border-almond rounded-lg min-h-[400px] ${
                    selectedLanguage === 'ar' ? 'text-right' : 'text-left'
                  }`}
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="prose prose-sm max-w-none">
                    {getTranslatedContent(selectedLanguage).split('\n').map((paragraph, index) => {
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-lg font-semibold text-cacao mt-6 mb-3">
                            {paragraph.replace('## ', '')}
                          </h2>
                        )
                      } else if (paragraph.startsWith('# ')) {
                        return (
                          <h1 key={index} className="text-xl font-bold text-cacao mt-6 mb-4">
                            {paragraph.replace('# ', '')}
                          </h1>
                        )
                      } else if (paragraph.match(/^\d+\./)) {
                        return (
                          <li key={index} className="text-sm text-cacao/80 mb-1 list-decimal">
                            {paragraph.replace(/^\d+\./, '').trim()}
                          </li>
                        )
                      } else if (paragraph.startsWith('- ')) {
                        return (
                          <li key={index} className="text-sm text-cacao/80 mb-1 list-disc">
                            {paragraph.replace('- ', '')}
                          </li>
                        )
                      } else if (paragraph.trim()) {
                        return (
                          <p key={index} className="text-sm text-cacao/80 mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      }
                      return <br key={index} />
                    })}
                  </div>
                </div>

                {/* Translation Note */}
                {selectedLanguage !== 'en' && (
                  <div className="p-3 bg-saffron/10 border border-saffron/30 rounded-lg">
                    <p className="text-xs text-saffron">
                      <strong>Note:</strong> This is a sample translation. In production, this would use professional medical translation services to ensure accuracy and cultural sensitivity.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Generate Consent Form
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Treatment Summary
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Discharge Instructions
        </Button>
      </div>
    </div>
  )
} 