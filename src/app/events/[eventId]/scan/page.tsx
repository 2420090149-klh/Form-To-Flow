"use client"

import { useEffect, useRef, useState, use } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export default function ScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const unwrappedParams = use(params)
  const [scanResult, setScanResult] = useState<{status: string, message: string, attendee?: any} | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const onScanSuccess = useCallback(async (decodedText: string) => {
    // Prevent multiple scans while processing
    if (scannerRef.current) {
      scannerRef.current.pause(true)
    }

    try {
      const res = await fetch(`/api/events/${unwrappedParams.eventId}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: decodedText })
      })

      const data = await res.json()
      setScanResult(data)

      // Automatically resume after 3 seconds
      setTimeout(() => {
        setScanResult(null)
        if (scannerRef.current) scannerRef.current.resume()
      }, 3000)

    } catch (err) {
      console.error(err)
      setScanResult({ status: "error", message: "Network Error" })
      setTimeout(() => {
        setScanResult(null)
        if (scannerRef.current) scannerRef.current.resume()
      }, 3000)
    }
  }, [unwrappedParams.eventId])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const onScanFailure = useCallback((error: any) => {
    // handle scan failure, usually better to ignore and keep scanning
  }, [])

  useEffect(() => {
    if (!unwrappedParams.eventId) return

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scannerRef.current.render(onScanSuccess, onScanFailure)

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err))
      }
    }
  }, [unwrappedParams.eventId, onScanSuccess, onScanFailure])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ticket Scanner</CardTitle>
          <CardDescription>Scan QR codes to check-in attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {scanResult && (
            <div className="mb-4">
              {scanResult.status === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Check-in Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
              {scanResult.status === "already_scanned" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
              {(scanResult.status === "invalid" || scanResult.status === "error") && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Invalid Ticket</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div id="reader" className="overflow-hidden rounded-lg"></div>
        </CardContent>
      </Card>
    </div>
  )
}
