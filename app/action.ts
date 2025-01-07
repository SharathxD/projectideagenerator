'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProjectIdeas(domain: string, techStack: string, complexity: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Generate 6 different project ideas for the following parameters:
    Domain: ${domain}
    Tech Stack/Tools: ${techStack}
    Complexity Level: ${complexity}

    For each project, provide:
    1. Project Title
    2. Brief Description (2-3 sentences)
    3. Key Features (3-5 bullet points)

    Format each project separately and make them distinct from each other.
    Ensure the projects are practical and aligned with the complexity level.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Split the text into individual projects and parse them
    const projects = text.split(/Project \d+:/).filter(Boolean).map(project => {
      const lines = project.trim().split('\n')
      const title = lines[0].trim()
      const descriptionLines = []
      const features = []
      let parsingFeatures = false

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.toLowerCase().startsWith('key features:')) {
          parsingFeatures = true
        } else if (parsingFeatures) {
          if (line.startsWith('-')) {
            features.push(line.slice(1).trim())
          }
        } else if (line) {
          descriptionLines.push(line)
        }
      }

      const description = descriptionLines.join(' ').trim()
      
      return { title, description, features }
    })

    return { success: true, ideas: projects }
  } catch (error) {
    console.error('Error generating project ideas:', error)
    return { 
      success: false, 
      error: 'Failed to generate project ideas. Please try again.' 
    }
  }
}

