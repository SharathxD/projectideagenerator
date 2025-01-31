'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProjectIdeas(domain: string, techStack: string, complexity: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Generate 6 different project ideas for the following parameters:
    - **Domain**: ${domain}
    - **Tech Stack**: ${techStack}
    - **Complexity Level**: ${complexity}

    Format each project **exactly like this**:
    
    **Project Title**: <Title Here>  
    **Description**: <Short 2-3 sentence description>  
    **Key Features**:  
    - Feature 1  
    - Feature 2  
    - Feature 3  
    - Feature 4  

    Separate each project with **three dashes (---)**.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Correctly splitting projects using '---' separator
    const projects = text.split('---').filter(Boolean).map(project => {
      const lines = project.trim().split('\n')
      let title = ""
      let description = ""
      const features: string[] = []
      let parsingFeatures = false

      lines.forEach(line => {
        line = line.trim()
        if (line.startsWith("**Project Title**:")) {
          title = line.replace("**Project Title**:", "").trim()
        } else if (line.startsWith("**Description**:")) {
          description = line.replace("**Description**:", "").trim()
        } else if (line.startsWith("- ")) {
          parsingFeatures = true
          features.push(line.substring(2).trim())  // Extracting bullet points
        }
      })

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
