"use client"

import { useEffect, useRef, useState, use, useCallback } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, XCircle, Scan, Maximize, QrCode } from "lucide-react"

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
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md border border-white/10">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Ticket Scanner
          </h1>
          <p className="text-white/50 text-sm">Align the QR code within the frame to verify.</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative rounded-3xl">
          
          <CardContent className="p-0">
            {/* Status Overlay */}
            {scanResult && (
              <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
                scanResult.status === "success" ? "bg-emerald-500/90" : 
                scanResult.status === "already_scanned" ? "bg-amber-500/90" : 
                "bg-rose-500/90"
              }`}>
                {scanResult.status === "success" && <CheckCircle2 className="w-24 h-24 text-white mb-6 drop-shadow-lg" />}
                {scanResult.status === "already_scanned" && <AlertTriangle className="w-24 h-24 text-white mb-6 drop-shadow-lg" />}
                {(scanResult.status === "invalid" || scanResult.status === "error") && <XCircle className="w-24 h-24 text-white mb-6 drop-shadow-lg" />}
                
                <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md">
                  {scanResult.status === "success" ? "Verified" : 
                   scanResult.status === "already_scanned" ? "Already Scanned" : 
                   "Invalid Ticket"}
                </h2>
                <p className="text-white/90 text-lg font-medium max-w-[280px]">
                  {scanResult.message}
                </p>
                {scanResult.attendee && (
                   <div className="mt-6 p-4 bg-black/20 rounded-xl w-full border border-white/10">
                     <p className="text-sm text-white/70 font-semibold uppercase tracking-wider mb-1">Guest</p>
                     <p className="text-xl font-bold text-white">{scanResult.attendee.name}</p>
                     {scanResult.attendee.teamName && (
                        <p className="text-sm text-white/80 mt-1">{scanResult.attendee.teamName}</p>
                     )}
                   </div>
                )}
              </div>
            )}

            <div className="relative">
              {/* html5-qrcode wrapper */}
              <div id="reader" className="w-full h-full [&>div]:border-none [&>div]:!bg-transparent [&_video]:object-cover [&_video]:rounded-none"></div>
              
              {/* Custom scanning reticle overlay (if camera is active, it shows behind the reticle) */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 z-10">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl translate-x-1 translate-y-1" />
                
                {/* Scanning animation line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary blur-[1px] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
            
          </CardContent>
        </Card>
        
        <div className="flex justify-center gap-4 text-white/40">
           <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
             <QrCode className="w-4 h-4" /> Auto Scan
           </div>
        </div>

      </div>
    </div>
  )
}
