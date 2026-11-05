import { motion } from 'framer-motion';
import { Check,Send } from 'lucide-react';
import React,{ useState } from 'react';

export default function NeighborAppForm({ ministryName,hideTypeSelection }: { ministryName: string; hideTypeSelection?: boolean }) {
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [type,setType]=useState('참가 신청');
  const [message,setMessage]=useState('');
  const [isSubmitted,setIsSubmitted]=useState(false);

  const handleSubmit=(e: React.FormEvent) => {
    e.preventDefault();
    if(ministryName!=='뮤직아카데미'&&(!name.trim()||!phone.trim())) {
      return;
    }
    setIsSubmitted(true);
  };

  if(isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0,scale: 0.95 }}
        animate={{ opacity: 1,scale: 1 }}
        className="p-8 rounded-2xl bg-brand-sage/5 border border-brand-sage/20 text-center space-y-4"
      >
        <div className="w-12 h-12 bg-brand-sage text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <Check className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-lg text-brand-brown">
            {ministryName==='뮤직아카데미'? '문의가 정상 접수되었습니다!':'신청이 정상 접수되었습니다!'}
          </h4>
          <p className="text-xs text-brand-brown/65 leading-relaxed max-w-sm mx-auto">
            {ministryName==='뮤직아카데미'
              ? `남겨주신 소중한 문의 내용은 ${ministryName} 담당 사역팀에 안전하게 전달되었습니다. 순차적으로 개별 연락드리겠습니다.`
              :`남겨주신 소중한 마음과 정보는 ${ministryName} 담당 사역팀에 안전하게 전달되었습니다. 순차적으로 개별 연락드리겠습니다.`
            }
          </p>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setName('');
            setPhone('');
            setMessage('');
          }}
          className="px-4 py-1.5 border border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-white transition-all text-xs font-semibold rounded-full bg-white cursor-pointer"
        >
          추가 문의하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {ministryName!=='뮤직아카데미'&&(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-brown mb-1.5">신청자 성함 *</label>
            <input
              type="text"
              placeholder="예시: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-gold/25 focus:ring-2 focus:ring-brand-sage/30 focus:border-brand-sage bg-brand-cream/10 text-sm text-brand-brown"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-brown mb-1.5">연락처 *</label>
            <input
              type="tel"
              placeholder="예시: 010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-gold/25 focus:ring-2 focus:ring-brand-sage/30 focus:border-brand-sage bg-brand-cream/10 text-sm text-brand-brown"
              required
            />
          </div>
        </div>
      )}

      {!hideTypeSelection&&(
        <div>
          <label className="block text-xs font-semibold text-brand-brown mb-1.5">참여 구분 (택일)</label>
          <div className="grid grid-cols-3 gap-2">
            {['참가 신청','봉사 동참','물품/재정 후원'].map((opt) => {
              const isSelected=type===opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setType(opt)}
                  className={`py-2 px-3 border rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${isSelected
                      ? "bg-brand-sage border-brand-sage text-white font-bold shadow-sm"
                      :"bg-white border-brand-gold/15 text-brand-brown/70 hover:bg-brand-cream/20"
                    }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-brand-brown mb-1.5">문의 및 하고 싶으신 말씀</label>
        <textarea
          rows={3}
          placeholder="함께 참여하시거나 사역에 동참하며 원하시는 문의 내용을 자유롭게 작성해 주세요."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-brand-gold/25 focus:ring-2 focus:ring-brand-sage/30 focus:border-brand-sage bg-brand-cream/10 text-sm text-brand-brown placeholder-brand-brown/40"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-brand-brown text-brand-cream hover:bg-brand-sage font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
      >
        <span>{ministryName==='뮤직아카데미'? '뮤직 아카데미 문의 전송':`${ministryName} 신청서 전송`}</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}