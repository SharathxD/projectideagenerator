'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { generateProjectIdeas } from './action'
import { Moon, Sun, Loader2, Lightbulb } from 'lucide-react'
import { domainTechStacks } from './techStack'

interface ProjectIdea {
  title: string
  description: string
  features: string[]
}

export default function ProjectIdeaGenerator() {
  const [domain, setDomain] = useState('')
  const [techStack, setTechStack] = useState('')
  const [complexity, setComplexity] = useState('')
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(isDarkMode)
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark')
  }

  const handleDomainChange = (value: string) => {
    setDomain(value)
    setTechStack('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setProjectIdeas([])

    const result = await generateProjectIdeas(domain, techStack, complexity)

    if (result.success && result.ideas) {
      setProjectIdeas(result.ideas)
    } else {
      setError(result.error || 'An unexpected error occurred')
    }

    setIsLoading(false)
  }

  const domains = Object.keys(domainTechStacks)
  const techStacks = domain ? domainTechStacks[domain] : []
  const complexityLevels = ['Beginner', 'Intermediate', 'Advanced']

  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Engineering Project Generator
          </h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-blue-600"
            />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </motion.div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-600">Select Your Project Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-lg font-medium">Domain</Label>
                  <Select value={domain} onValueChange={handleDomainChange} required>
                    <SelectTrigger id="domain" className="bg-white dark:bg-gray-800 border-2 border-blue-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="techStack" className="text-lg font-medium">Tech Stack</Label>
                  <Select value={techStack} onValueChange={setTechStack} required disabled={!domain}>
                    <SelectTrigger id="techStack" className="bg-white dark:bg-gray-800 border-2 border-blue-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select a tech stack" />
                    </SelectTrigger>
                    <SelectContent>
                      {techStacks.map((ts) => (
                        <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complexity" className="text-lg font-medium">Complexity Level</Label>
                  <Select value={complexity} onValueChange={setComplexity} required>
                    <SelectTrigger id="complexity" className="bg-white dark:bg-gray-800 border-2 border-blue-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      {complexityLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-lg transition-colors"
                disabled={isLoading || !domain || !techStack || !complexity}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  'Generate Project Ideas'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-600 text-center font-semibold" 
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {projectIdeas.length > 0 && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectIdeas.map((idea, index) => (
                <motion.div key={index} className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                      {idea.description}
                    </ReactMarkdown>
                  </CardContent>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
