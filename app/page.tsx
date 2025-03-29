"use client"

import { useEffect, useState } from "react"
import { Inter } from "next/font/google"

import { ClientOnly } from "@/lib/client-only"
import { SettingsProvider } from "@/lib/settings-provider"
import { AIPresetDialog, AIPresetsDialog } from "@/components/ai-presets-dialog"
import { AIPresetsSelector } from "@/components/ai-presets-selector"
import { PlaygroundCard } from "@/components/playground-card"

import componentsList from "../content/components-list.json"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

interface Pipe {
  id: string
  name: string
  description: string
}

function isMacOS() {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0
}

export default function Page() {
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://screenpi.pe/api/plugins/registry")
      .then((res) => res.json())
      .then((data) => {
        const transformedPipes = data.map((pipe: any) => ({
          id: pipe.id,
          name: pipe.name,
          description: pipe.description?.split("\n")[0] || "",
        }))
        setPipes(transformedPipes)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching pipes:", error)
        setLoading(false)
      })
  }, [])

  return (
    <SettingsProvider>
      <ClientOnly>
        <div
          className={`mt-12 flex h-full flex-col items-center justify-center gap-6 px-4 pb-12 ${inter.className}`}
        >
          <h1 className="mb-0 text-2xl font-bold">
            example app (pipe) for developers
          </h1>
          <p className="-mt-5 mb-2 text-gray-600">
            ready-to-use components for engineers building apps with screenpipe
          </p>
          {componentsList.map((cardContent, index) => {
            if (cardContent.macOSOnly && !isMacOS()) {
              return null // Skip rendering if it's macOS only and not on macOS
            }
            return <PlaygroundCard key={index} content={cardContent} />
          })}

          <div className="mt-8 w-full max-w-4xl font-mono">
            <h2 className="mb-4 text-left text-xl font-semibold">
              other pre-built components
            </h2>
            <p className="mb-6 text-left text-gray-600">
              you can install other pre-built components like this:
              <br />
              <br />
              <code className="rounded bg-gray-100 p-1">
                bunx --bun @screenpipe/dev@latest components add
              </code>
              <br />
              <br />
              or use npx
            </p>

            <h2 className="mb-4 text-left text-xl font-semibold">
              open source pipes
            </h2>
            <p className="mb-6 text-left text-gray-600">
              All pipes are open source and you can directly fork or reuse pipes
              or components.
              <br />
              Source:{" "}
              <a
                href="https://github.com/mediar-ai/screenpipe/tree/main/pipes"
                className="text-blue-500 underline"
              >
                https://github.com/mediar-ai/screenpipe/tree/main/pipes
              </a>
            </p>

            {loading ? (
              <p className="text-gray-500">Loading available pipes...</p>
            ) : (
              <div className="w-full max-w-4xl rounded border border-gray-200 bg-gray-100 p-4 text-sm">
                {pipes.map((pipe, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <span className="font-medium">[{index}]</span>{" "}
                    <span className="font-semibold">{pipe.name}</span> -{" "}
                    {pipe.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ClientOnly>
    </SettingsProvider>
  )
}
