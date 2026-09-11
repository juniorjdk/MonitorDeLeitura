import { useRef, useState } from 'react'

export default function Backup({ plans, onImport }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  const exportBackup = () => {
    const payload = { app: 'biblia-plano-pwa', version: 1, exportedAt: new Date().toISOString(), plans }
    const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plano-leitura-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setMsg('Backup exportado. Guarde o arquivo .json em local seguro.')
  }

  const importBackup = (file) => {
    setMsg('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const arr = Array.isArray(data) ? data : data.plans
        if (!Array.isArray(arr)) throw new Error('formato inválido')
        onImport(arr)
        setMsg(`${arr.length} plano(s) importado(s) com sucesso.`)
      } catch {
        setMsg('Arquivo inválido. Selecione um backup .json gerado pelo app.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4">
      <h2 className="font-serif text-xl font-bold text-forestdeep">Backup</h2>
      <p className="mt-1 text-sm text-inksoft">
        Seus dados ficam salvos neste dispositivo (localStorage, com armazenamento persistente). Exporte um backup para transferir de aparelho ou se proteger.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={exportBackup} className="rounded-xl bg-forest py-2.5 text-sm font-semibold text-white">
          ⬇ Exportar backup
        </button>
        <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-forest bg-white py-2.5 text-sm font-semibold text-forest">
          ⬆ Importar backup
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importBackup(f)
          e.target.value = ''
        }}
      />
      {msg && <p className="mt-2 rounded-lg bg-paper2 p-2 text-[13px] text-forestdeep">{msg}</p>}
    </div>
  )
}
