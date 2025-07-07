import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, Download, Eye, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Mock imaging data
const mockImages = [
  {
    id: 1,
    type: 'CT Chest',
    date: '2024-01-15',
    url: '/api/placeholder/600/400',
    findings: [
      { x: 45, y: 30, label: 'Primary lesion', severity: 'high', description: '2.1cm mass in LUL' },
      { x: 20, y: 60, label: 'Lymph node', severity: 'medium', description: 'Enlarged paratracheal node' }
    ],
    aiAnalysis: 'AI detected suspicious 2.1cm nodule with spiculated margins. Recommend biopsy.',
    radiologist: 'Dr. Smith',
    status: 'Final'
  },
  {
    id: 2,
    type: 'MRI Brain',
    date: '2024-01-20',
    url: '/api/placeholder/600/400',
    findings: [
      { x: 60, y: 40, label: 'No metastases', severity: 'low', description: 'No evidence of brain metastases' }
    ],
    aiAnalysis: 'No suspicious findings detected. Normal brain parenchyma.',
    radiologist: 'Dr. Johnson',
    status: 'Final'
  },
  {
    id: 3,
    type: 'PET/CT',
    date: '2024-01-25',
    url: '/api/placeholder/600/400',
    findings: [
      { x: 50, y: 35, label: 'Hypermetabolic lesion', severity: 'high', description: 'SUVmax 8.2' },
      { x: 30, y: 50, label: 'Mediastinal uptake', severity: 'medium', description: 'SUVmax 4.1' }
    ],
    aiAnalysis: 'Primary tumor shows high metabolic activity. No distant metastases.',
    radiologist: 'Dr. Williams',
    status: 'Final'
  }
]

export function ImageCarousel({ patientId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCallouts, setShowCallouts] = useState(true)
  const [selectedFinding, setSelectedFinding] = useState(null)

  const currentImage = mockImages[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % mockImages.length)
    setSelectedFinding(null)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + mockImages.length) % mockImages.length)
    setSelectedFinding(null)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-clay text-white'
      case 'medium':
        return 'bg-saffron text-white'
      case 'low':
        return 'bg-sage text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Viewer */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {currentImage.type} - {currentImage.date}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCallouts(!showCallouts)}
                className={showCallouts ? 'bg-sage/10 border-sage/30' : ''}
              >
                <Brain className="h-3 w-3 mr-1" />
                AI Callouts
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="h-3 w-3 mr-1" />
                Zoom
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Image Container */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border border-almond">
              {/* Placeholder for actual medical image */}
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gray-400 rounded-full mx-auto flex items-center justify-center">
                    <Eye className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-600 font-medium">{currentImage.type}</p>
                  <p className="text-sm text-gray-500">{currentImage.date}</p>
                </div>
              </div>

              {/* AI Callouts Overlay */}
              {showCallouts && currentImage.findings.map((finding, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="absolute cursor-pointer"
                  style={{ 
                    left: `${finding.x}%`, 
                    top: `${finding.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedFinding(finding)}
                >
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)} animate-pulse`} />
                  <div className={`w-6 h-6 rounded-full ${getSeverityColor(finding.severity)} opacity-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping`} />
                </motion.div>
              ))}

              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                disabled={mockImages.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                disabled={mockImages.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {mockImages.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Details & Findings */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* AI Analysis */}
        <Card className="bg-parchment border-almond">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-cacao flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-cacao/80">{currentImage.aiAnalysis}</p>
              <div className="flex items-center justify-between text-xs text-cacao/60">
                <span>Radiologist: {currentImage.radiologist}</span>
                <Badge className="bg-sage/20 text-sage">
                  {currentImage.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings List */}
        <Card className="bg-parchment border-almond">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-cacao">
              Findings ({currentImage.findings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentImage.findings.map((finding, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFinding === finding 
                      ? 'border-sage/50 bg-sage/10' 
                      : 'border-almond hover:border-sage/30'
                  }`}
                  onClick={() => setSelectedFinding(finding)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-cacao">{finding.label}</span>
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(finding.severity).replace('text-white', '')}`} />
                  </div>
                  <p className="text-xs text-cacao/70">{finding.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {mockImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => {
              setCurrentIndex(index)
              setSelectedFinding(null)
            }}
            className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${
              index === currentIndex 
                ? 'border-sage bg-sage/10' 
                : 'border-almond hover:border-sage/30'
            }`}
          >
            <div className="w-16 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
              <Eye className="h-4 w-4 text-gray-600" />
            </div>
            <div className="mt-1 text-xs text-center">
              <p className="font-medium text-cacao">{image.type}</p>
              <p className="text-cacao/60">{image.date}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 