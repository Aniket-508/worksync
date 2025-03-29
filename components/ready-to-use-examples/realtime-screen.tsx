"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { pipe, VisionEvent } from "@screenpipe/browser"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RealtimeScreen({
  onDataChange,
}: {
  onDataChange?: (data: any, error: string | null) => void
}) {
  const [visionEvent, setVisionEvent] = useState<VisionEvent | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withOcr, setWithOcr] = useState(true)
  const [withImages, setWithImages] = useState(true)

  const startStreaming = async () => {
    try {
      setError(null)
      setIsStreaming(true)

      // Add error handling for the analytics connection issue
      const originalConsoleError = console.error
      console.error = function (msg, ...args) {
        // Filter out the analytics connection errors
        if (
          typeof msg === "string" &&
          (msg.includes("failed to fetch settings") ||
            msg.includes("ERR_CONNECTION_REFUSED"))
        ) {
          // Suppress these specific errors
          return
        }
        originalConsoleError.apply(console, [msg, ...args])
      }

      for await (const event of pipe.streamVision(withOcr)) {
        if (event.data) {
          // Only update the vision event if the data is valid
          if (isValidVisionEvent(event.data)) {
            setVisionEvent(event.data)

            // Pass the raw data to the parent component for display in the raw output tab
            if (onDataChange) {
              onDataChange(event.data, null)
            }

            console.log("vision event:", {
              ts: event.data.timestamp,
              hasText: !!event.data.text,
              imgSize: event.data.image?.length,
            })
          }
        }
      }

      // Restore original console.error
      console.error = originalConsoleError
    } catch (error) {
      console.error("vision stream failed:", error)
      const errorMessage =
        error instanceof Error
          ? `Failed to stream vision: ${error.message}`
          : "Failed to stream vision"
      setError(errorMessage)

      // Pass the error to the parent component
      if (onDataChange) {
        onDataChange(null, errorMessage)
      }

      setIsStreaming(false)
    }
  }

  const stopStreaming = () => {
    setIsStreaming(false)
  }

  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [])

  // Helper function to validate vision event data
  const isValidVisionEvent = (event: VisionEvent): boolean => {
    // Check if timestamp is valid
    const hasValidTimestamp =
      event.timestamp && !isNaN(new Date(event.timestamp).getTime())

    // Check if app_name and window_name are valid strings
    const hasValidAppName = !!event.app_name && event.app_name !== "Unknown"
    const hasValidWindowName =
      !!event.window_name && event.window_name !== "Unknown"

    // Return true if the event has at least some valid data
    return hasValidTimestamp || hasValidAppName || hasValidWindowName
  }

  const renderVisionContent = (event: VisionEvent) => {
    return (
      <div className="space-y-2 text-xs">
        <div className="flex flex-col text-slate-600">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">app_name: </span>
              <span>{event.app_name || "Not available"}</span>
            </div>
            <div>
              <span className="font-semibold">timestamp: </span>
              <span>
                {event.timestamp && !isNaN(new Date(event.timestamp).getTime())
                  ? new Date(event.timestamp).toLocaleString()
                  : "Not available"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">window_name: </span>
              <span>{event.window_name || "Not available"}</span>
            </div>
            <div>
              <span className="font-semibold">type: </span>
              <span>Window</span>
            </div>
          </div>
        </div>

        {event.image && withImages && (
          <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={`data:image/jpeg;base64,${event.image}`}
              alt="screen capture"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {withOcr && event.text && (
          <div className="h-[230px] overflow-auto whitespace-pre-wrap rounded bg-slate-100 p-2 font-mono text-xs">
            {event.text}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          onClick={isStreaming ? stopStreaming : startStreaming}
          size="sm"
        >
          {isStreaming ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Stop Streaming
            </>
          ) : (
            "Start Streaming"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWithOcr(!withOcr)}
            className={`relative ${withOcr ? "border-black" : "border-gray-300"}`}
          >
            <span>OCR</span>
            <div
              className={`ml-2 h-4 w-8 rounded-full border transition-colors ${withOcr ? "border-black bg-black" : "border-gray-300 bg-gray-100"}`}
            >
              <div
                className={`absolute h-3 w-3 rounded-full transition-transform ${withOcr ? "translate-x-4 bg-white" : "translate-x-1 bg-white"}`}
              ></div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWithImages(!withImages)}
            className={`relative ${withImages ? "border-black" : "border-gray-300"}`}
          >
            <span>Images</span>
            <div
              className={`ml-2 h-4 w-8 rounded-full border transition-colors ${withImages ? "border-black bg-black" : "border-gray-300 bg-gray-100"}`}
            >
              <div
                className={`absolute h-3 w-3 rounded-full transition-transform ${withImages ? "translate-x-4 bg-white" : "translate-x-1 bg-white"}`}
              ></div>
            </div>
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {visionEvent && renderVisionContent(visionEvent)}

      <div className="flex items-center justify-end gap-1.5 text-right">
        <div
          className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "bg-green-500" : "bg-gray-400"}`}
        />
        <span className="font-mono text-xs text-gray-500">
          {isStreaming ? "streaming" : "stopped"}
        </span>
      </div>
    </div>
  )
}
