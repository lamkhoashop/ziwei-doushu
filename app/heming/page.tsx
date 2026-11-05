'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart as buildChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';
import { useTheme } from '@/components/ThemeProvider';

// ─── AiContent Renderer ────────────────────────────────────
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} style={{ paddingTop: i === 0 ? 0 : '14px', paddingBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ac)', letterSpacing: '0.04em' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} style={{ height: '4px' }} />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} style={{ fontSize: '13px', lineHeight: 1.75, color: 'var(--tx-2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} style={{ fontWeight: 500, color: 'var(--tx-0)' }}>{part}</strong>
            )}
          </div>
        );
      })}
      {streaming && (
        <span style={{
          display: 'inline-block', width: '7px', height: '13px',
          background: 'var(--ac)', opacity: 0.5, borderRadius: '2px',
          animation: 'pulse 1s ease-in-out infinite',
          verticalAlign: 'middle', marginLeft: '2px',
        }} />
      )}
    </div>
  );
}

export default function HemingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ─── Trạng thái hai lá số ────────────────────────────────
  const [chartA, setChartA] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [formA, setFormA] = useState<BirthFormState | null>(null);
  const [formB, setFormB] = useState<BirthFormState | null>(null);

  // ─── AI Hợp bàn trạng thái ───────────────────────────────
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [analysisError, setAnalysisError] = useState(false);
  const [apiMissing, setApiMissing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // ─── An sao nội bộ ───────────────────────────────────────
  const generateChart = useCallback(async (info: BirthInfo): Promise<ZiweiChart | null> => {
    try {
      return buildChart(info);
    } catch {
      return null;
    }
  }, []);

  // 表单是否填齐
  const isFormReady = (f: BirthFormState | null): boolean =>
    !!(f && f.year && f.month && f.day && f.gender && (f.unknownTime || (f.clockHour !== '' && f.clockMinute !== '')));

  // ─── Luận giải Song bàn đối chiếu ─────────────────────────
  const runAnalysis = useCallback(async (q?: string) => {
    setFormError(null);
    if (!isFormReady(formA) || !isFormReady(formB)) {
      setFormError('Vui lòng điền đầy đủ thông tin sinh thần của cả 2 bên (A và B)');
      return;
    }
    setAnalyzing(true);
    setAnalysis('');
    setAnalysisError(false);
    setApiMissing(false);

    try {
      // 每次按当前表单起盘，避免编辑出生信息后复用旧盘。
      const [cA, cB] = await Promise.all([
        generateChart(formToBirthInfo(formA!)),
        generateChart(formToBirthInfo(formB!)),
      ]);
      if (!cA || !cB) {
        setAnalysisError(true);
        setAnalyzing(false);
        return;
      }
      setChartA(cA);
      setChartB(cB);

      const res = await fetch('/api/heming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartA: cA, chartB: cB, question: q ?? undefined }),
      });
      if (res.status === 404) { setApiMissing(true); throw new Error('api-missing'); }
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let pendingLine = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        pendingLine += decoder.decode(value, { stream: true });
        const lines = pendingLine.split('\n');
        pendingLine = lines.pop() ?? '';
        for (const rawLine of lines) {
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text ?? parsed.text ?? parsed.choices?.[0]?.delta?.content ?? '';
            text += delta;
            setAnalysis(text);
          } catch { /* skip */ }
        }
      }
      // scroll to analysis
      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  }, [formA, formB, generateChart]);

  const cardStyle = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,160,60,0.2)'}`,
    borderRadius: '16px',
    padding: '24px',
  };

  const labelStyle = {
    fontSize: '11px', letterSpacing: '0.2em', color: 'var(--ac)', opacity: 0.85,
    marginBottom: '16px', display: 'block', fontWeight: 600,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--tx-0)' }}>
      {/* ── Top Bar ── */}
      <div style={{
        height: '52px', borderBottom: '1px solid var(--bdr)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none', border: 'none', color: 'var(--tx-2)',
              cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            ← Trang chủ
          </button>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ac)', letterSpacing: '0.15em' }}>
          HỢP SỐ · SONG BÀN ĐỐI CHIẾU
        </div>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Banner Tiêu đề */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--tx-0)' }}>
            HỢP SỐ TỬ VI · SONG BÀN ĐỐI CHIẾU
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto' }}>
            Đối chiếu lá số 2 người theo lý pháp Thiên Kỷ Nghê Hải Hà: Phân tích cộng hưởng tính cách,
            hợp hôn tình duyên, tương trợ tài lộc và hợp tác sự nghiệp.
          </p>
        </div>

        {/* Biểu mẫu 2 cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}
          className="heming-grid">
          {/* Bên A */}
          <div style={cardStyle}>
            <span style={labelStyle}>BÊN THỨ NHẤT — LÁ SỐ A</span>
            <BirthForm
              hideSubmit
              onSubmit={() => {}}
              onFormSave={setFormA}
            />
          </div>

          {/* Bên B */}
          <div style={cardStyle}>
            <span style={labelStyle}>BÊN THỨ HAI — LÁ SỐ B</span>
            <BirthForm
              hideSubmit
              onSubmit={() => {}}
              onFormSave={setFormB}
            />
          </div>
        </div>

        {/* ═══ Khung kết quả Hợp bàn ════════════════ */}
        <div ref={analysisRef} style={{
          ...cardStyle,
          minHeight: '320px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: (!analysis && !analyzing) ? 'center' : 'flex-start',
        }}>
          {/* Tiêu đề mục */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: (analysis || analyzing) ? '20px' : '24px' }}>
            <span style={{ color: 'var(--ac)', opacity: 0.8 }}>◉</span>
            <span style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--tx-3)', fontWeight: 600 }}>
              KẾT QUẢ HỢP SỐ · ĐỐI CHIẾU SONG BÀN
            </span>
          </div>

          {/* Chưa chạy */}
          {!analysis && !analyzing && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '13px', color: 'var(--tx-3)', marginBottom: '24px', lineHeight: 1.8 }}>
                Điền đầy đủ thông tin sinh thần của cả 2 bên, sau đó nhấn nút bên dưới.<br />
                Hệ thống AI Agent Mệnh Lý sẽ tự động an sao và phân tích chi tiết độ hòa hợp.
              </div>
              <button
                onClick={() => runAnalysis()}
                style={{
                  padding: '14px 44px', borderRadius: 'var(--r-pill)', border: 'none',
                  background: 'linear-gradient(135deg, #9a6210, #c88020)',
                  color: '#fff8e8', fontSize: '14px', fontWeight: 600,
                  letterSpacing: '0.12em', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(140,100,20,0.25)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                BẮT ĐẦU PHÂN TÍCH HỢP SỐ
              </button>
              {formError && (
                <div style={{ marginTop: '20px', fontSize: '13px', color: '#dc2626' }}>
                  {formError}
                </div>
              )}
            </div>
          )}

          {analyzing && !analysis && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px 0', color: 'var(--tx-3)', fontSize: '13px' }}>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid var(--bdr-med)', borderTopColor: 'var(--ac)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              Đang đối chiếu song bàn và suy diễn tương tác âm dương ngũ hành…
            </div>
          )}

          {analysis && <AiContent text={analysis} streaming={analyzing} />}

          {analysisError && !apiMissing && (
            <div style={{ padding: '14px 18px', borderRadius: '10px', border: '1px solid #f87171', background: 'rgba(248,113,113,0.08)', fontSize: '13px', color: '#f87171', marginTop: '12px' }}>
              Phân tích tạm thời chưa khả dụng, vui lòng kiểm tra API Key và thử lại.
            </div>
          )}
          {apiMissing && (
            <div style={{ padding: '14px 18px', borderRadius: '10px', border: '1px solid #f87171', background: 'rgba(248,113,113,0.08)', fontSize: '13px', color: '#f87171', marginTop: '12px' }}>
              Tính năng Luận giải Hợp hôn đang được bảo trì hoặc chưa cấu hình API.
            </div>
          )}
        </div>

        {/* ═══ Chat hỏi thêm về hợp số ═══════════ */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--tx-3)', marginBottom: '4px', fontWeight: 600 }}>
              HỎI THÊM VỀ MỐI QUAN HỆ NÀY
            </div>

            {/* Câu hỏi nhanh */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'Độ hòa hợp tình cảm ra sao?',
                'Có phù hợp để hợp tác làm ăn?',
                'Kết hôn với nhau cần lưu ý gì?',
                'Mặt nào dễ xảy ra mâu thuẫn nhất?',
                'Tài vận hai bên có bổ trợ cho nhau?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setQuestion(q); runAnalysis(q); }}
                  disabled={analyzing}
                  style={{
                    fontSize: '12px', padding: '6px 14px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--bdr-med)',
                    background: 'transparent', color: 'var(--tx-2)',
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    opacity: analyzing ? 0.5 : 1,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!analyzing) (e.currentTarget as HTMLElement).style.borderColor = 'var(--ac-bdr)'; }}
                  onMouseLeave={e => { if (!analyzing) (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-med)'; }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Hộp nhập câu hỏi */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !analyzing) runAnalysis(question || undefined); }}
                placeholder="Nhập câu hỏi thêm, ví dụ: Những năm nào dễ xảy ra bất đồng?..."
                disabled={analyzing}
                className="input-base"
                style={{ fontSize: '13px', flex: 1 }}
              />
              <button
                onClick={() => runAnalysis(question || undefined)}
                disabled={analyzing}
                style={{
                  padding: '10px 24px', borderRadius: 'var(--r-sm)', border: 'none',
                  background: analyzing ? 'var(--bg-2)' : 'var(--ac)',
                  color: analyzing ? 'var(--tx-3)' : '#1a1000',
                  fontSize: '13px', fontWeight: 600,
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {analyzing ? 'Đang hỏi…' : 'Gửi câu hỏi'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 680px) {
          .heming-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
