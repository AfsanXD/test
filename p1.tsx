import { useState, useEffect } from 'react'
import { Button } from "/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "/components/ui/card"
import { Input } from "/components/ui/input"
import { Label } from "/components/ui/label"
import { RadioGroup, RadioGroupItem } from "/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/components/ui/select"
import { Terminal, Wifi, Server, Clock, RefreshCw, Copy, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type PingResult = {
  sequence: number
  status: 'success' | 'timeout' | 'error'
  time?: number
  ttl?: number
  error?: string
}

type TraceHop = {
  hop: number
  ip: string
  times: (number | null)[]
  status: 'success' | 'timeout' | 'error'
}

export default function NetworkProfessional() {
  const [ipAddress, setIpAddress] = useState('')
  const [ipVersion, setIpVersion] = useState('ipv4')
  const [action, setAction] = useState<'ping' | 'traceroute' | null>(null)
  const [pingResults, setPingResults] = useState<PingResult[]>([])
  const [traceResults, setTraceResults] = useState<TraceHop[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = useState(4)
  const [timeout, setTimeout] = useState(2000)
  const [copySuccess, setCopySuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock function to simulate ping with realistic timing
  const mockPing = async () => {
    setIsLoading(true)
    setPingResults([])
    setError(null)
    
    const results: PingResult[] = []
    for (let i = 1; i <= count; i++) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      
      // Simulate occasional failures
      const shouldFail = Math.random() < 0.1
      const shouldTimeout = Math.random() < 0.05
      
      if (shouldFail) {
        results.push({
          sequence: i,
          status: 'error',
          error: 'Destination host unreachable'
        })
      } else if (shouldTimeout) {
        results.push({
          sequence: i,
          status: 'timeout'
        })
      } else {
        results.push({
          sequence: i,
          status: 'success',
          time: Math.floor(10 + Math.random() * 30),
          ttl: Math.floor(50 + Math.random() * 20)
        })
      }
      
      setPingResults([...results])
    }
    
    setIsLoading(false)
  }

  // Mock function to simulate traceroute with realistic timing
  const mockTraceroute = async () => {
    setIsLoading(true)
    setTraceResults([])
    setError(null)
    
    const hops: TraceHop[] = []
    const hopCount = 5 + Math.floor(Math.random() * 10)
    
    for (let i = 1; i <= hopCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800))
      
      // Simulate occasional timeouts
      const shouldTimeout = i === hopCount ? false : Math.random() < 0.1
      
      if (shouldTimeout) {
        hops.push({
          hop: i,
          ip: 'Request timed out',
          times: [null, null, null],
          status: 'timeout'
        })
      } else {
        const ip = i === hopCount ? ipAddress : 
          `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        
        hops.push({
          hop: i,
          ip,
          times: [
            Math.floor(5 + Math.random() * 50),
            Math.floor(5 + Math.random() * 50),
            Math.floor(5 + Math.random() * 50)
          ],
          status: 'success'
        })
      }
      
      setTraceResults([...hops])
    }
    
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipAddress) {
      setError('Please enter an IP address')
      return
    }
    
    if (!isValidIP(ipAddress, ipVersion)) {
      setError(`Please enter a valid ${ipVersion.toUpperCase()} address`)
      return
    }
    
    if (action === 'ping') {
      mockPing()
    } else if (action === 'traceroute') {
      mockTraceroute()
    }
  }

  const isValidIP = (ip: string, version: string) => {
    if (version === 'ipv4') {
      return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)
    } else {
      return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)
    }
  }

  const copyResultsToClipboard = () => {
    const textToCopy = action === 'ping' 
      ? pingResults.map(r => 
          r.status === 'success' 
            ? `Reply from ${ipAddress}: bytes=32 time=${r.time}ms TTL=${r.ttl}`
            : r.status === 'timeout'
              ? 'Request timed out'
              : r.error
        ).join('\n')
      : traceResults.map(h => 
          h.status === 'success'
            ? `${h.hop}\t${h.times.map(t => t ? `${t}ms` : '*').join('\t')}\t${h.ip}`
            : `${h.hop}\t*\t*\t*\tRequest timed out`
        ).join('\n')
    
    navigator.clipboard.writeText(textToCopy)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const getPingStatistics = () => {
    const successfulPings = pingResults.filter(p => p.status === 'success')
    const lostPings = pingResults.length - successfulPings.length
    const lossPercentage = (lostPings / pingResults.length) * 100
    const times = successfulPings.map(p => p.time || 0)
    const min = Math.min(...times)
    const max = Math.max(...times)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    
    return {
      sent: pingResults.length,
      received: successfulPings.length,
      lost: lostPings,
      lossPercentage,
      min,
      max,
      avg
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700">
                    <Terminal className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                      Network Professional
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Advanced network diagnostic tool
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-emerald-400">
                  <Wifi className="h-4 w-4" />
                  <span>Online</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress" className="text-gray-300 flex items-center space-x-2">
                      <Server className="h-4 w-4 text-emerald-400" />
                      <span>IP Address or Hostname</span>
                    </Label>
                    <Input
                      id="ipAddress"
                      value={ipAddress}
                      onChange={(e) => {
                        setIpAddress(e.target.value)
                        setError(null)
                      }}
                      placeholder={ipVersion === 'ipv4' ? 'e.g. 8.8.8.8' : 'e.g. 2001:4860:4860::8888'}
                      className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus-visible:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>IP Version</span>
                    </Label>
                    <RadioGroup 
                      value={ipVersion}
                      onValueChange={(value) => {
                        setIpVersion(value)
                        setError(null)
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ipv4" id="ipv4" className="text-emerald-500 border-gray-600 hover:border-emerald-400" />
                        <Label htmlFor="ipv4" className="text-gray-300">IPv4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ipv6" id="ipv6" className="text-emerald-500 border-gray-600 hover:border-emerald-400" />
                        <Label htmlFor="ipv6" className="text-gray-300">IPv6</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="count" className="text-gray-300">Ping Count</Label>
                    <Select 
                      value={count.toString()} 
                      onValueChange={(value) => setCount(parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 hover:border-emerald-400">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {[1, 4, 8, 16, 32].map(num => (
                          <SelectItem key={num} value={num.toString()} className="hover:bg-gray-800 focus:bg-gray-800">
                            {num} {num === 1 ? 'packet' : 'packets'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-gray-300">Timeout (ms)</Label>
                    <Select 
                      value={timeout.toString()} 
                      onValueChange={(value) => setTimeout(parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 hover:border-emerald-400">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {[1000, 2000, 3000, 5000].map(ms => (
                          <SelectItem key={ms} value={ms.toString()} className="hover:bg-gray-800 focus:bg-gray-800">
                            {ms} ms
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end space-x-4 pt-2">
                    <Button 
                      type="submit"
                      variant={action === 'ping' ? 'default' : 'outline'}
                      onClick={() => setAction('ping')}
                      disabled={!ipAddress || !isValidIP(ipAddress, ipVersion) || isLoading}
                      className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white flex-1 border-emerald-700 shadow-lg shadow-emerald-500/20"
                    >
                      {isLoading && action === 'ping' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <span>Ping</span>
                      )}
                    </Button>
                    <Button 
                      type="submit"
                      variant={action === 'traceroute' ? 'default' : 'outline'}
                      onClick={() => setAction('traceroute')}
                      disabled={!ipAddress || !isValidIP(ipAddress, ipVersion) || isLoading}
                      className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white flex-1 border-blue-700 shadow-lg shadow-blue-500/20"
                    >
                      {isLoading && action === 'traceroute' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <span>Traceroute</span>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center p-3 text-sm text-red-400 bg-red-900/30 border border-red-800/50 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </motion.div>
                )}
              </form>

              <AnimatePresence>
                {(pingResults.length > 0 || traceResults.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                  >
                    <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-gray-700">
                        <CardTitle className="text-lg font-semibold text-gray-200">
                          {action === 'ping' ? 'Ping Results' : 'Traceroute Results'}
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={copyResultsToClipboard}
                          className="text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="font-mono text-sm bg-gray-900 p-4 rounded-b">
                          {action === 'ping' ? (
                            <>
                              <div className="text-emerald-400 mb-2">
                                Pinging {ipAddress} with 32 bytes of data:
                              </div>
                              {pingResults.map((result, index) => (
                                <div key={index} className="mb-1">
                                  {result.status === 'success' ? (
                                    <span className="text-gray-300">
                                      Reply from {ipAddress}: bytes=32 time={result.time}ms TTL={result.ttl}
                                    </span>
                                  ) : result.status === 'timeout' ? (
                                    <span className="text-yellow-400">Request timed out</span>
                                  ) : (
                                    <span className="text-red-400">{result.error}</span>
                                  )}
                                </div>
                              ))}
                              {pingResults.length > 0 && (
                                <div className="mt-4 text-gray-400">
                                  <div>Ping statistics for {ipAddress}:</div>
                                  <div className="ml-4">
                                    Packets: Sent = {getPingStatistics().sent}, Received = {getPingStatistics().received}, Lost = {getPingStatistics().lost} ({getPingStatistics().lossPercentage.toFixed(0)}% loss),
                                  </div>
                                  <div>Approximate round trip times in milli-seconds:</div>
                                  <div className="ml-4">
                                    Minimum = {getPingStatistics().min}ms, Maximum = {getPingStatistics().max}ms, Average = {getPingStatistics().avg.toFixed(1)}ms
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-blue-400 mb-2">
                                Tracing route to {ipAddress} over a maximum of 30 hops:
                              </div>
                              <div className="grid grid-cols-12 gap-1 mb-1 text-gray-500 text-xs">
                                <div className="col-span-1">Hop</div>
                                <div className="col-span-3">Address</div>
                                <div className="col-span-8">Times (ms)</div>
                              </div>
                              {traceResults.map((hop, index) => (
                                <div key={index} className="grid grid-cols-12 gap-1 mb-1">
                                  <div className="col-span-1 text-gray-400">{hop.hop}</div>
                                  <div className="col-span-3">
                                    {hop.status === 'success' ? (
                                      <span className="text-gray-300">{hop.ip}</span>
                                    ) : (
                                      <span className="text-yellow-400">Request timed out</span>
                                    )}
                                  </div>
                                  <div className="col-span-8 flex space-x-2">
                                    {hop.times.map((time, i) => (
                                      <span key={i} className={time ? 'text-gray-300' : 'text-yellow-400'}>
                                        {time ? `${time}ms` : '*'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {traceResults.length > 0 && (
                                <div className="mt-2 text-gray-400">
                                  Trace complete.
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 py-3">
              <div>Network Professional v1.0</div>
              <div className="flex items-center space-x-2">
                <span>Status: {isLoading ? 'Testing...' : 'Ready'}</span>
                <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}