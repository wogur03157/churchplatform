import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";

export default function PrayerRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [prayerName, setPrayerName] = useState("");
  const [prayerContact, setPrayerContact] = useState("");
  const [prayerTopic, setPrayerTopic] = useState("영적 성장 및 믿음");
  const [prayerContent, setPrayerContent] = useState("");

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      isAnonymous,
      name: isAnonymous ? "익명" : prayerName,
      contact: prayerContact,
      topic: prayerTopic,
      content: prayerContent,
    });
    setIsSubmitted(true);
    setPrayerName("");
    setPrayerContact("");
    setPrayerTopic("영적 성장 및 믿음");
    setPrayerContent("");
  };

  return (
    <AnimatePresence>
        {open&&(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onClose()}
              className="absolute inset-0 bg-brand-brown/65 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0,scale: 0.95,y: 20 }}
              animate={{ opacity: 1,scale: 1,y: 0 }}
              exit={{ opacity: 0,scale: 0.95,y: 20 }}
              className="relative bg-brand-cream w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-gold/20 flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-brand-gold/10 flex items-center justify-between bg-white">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">기도의 집</h3>
                  <p className="text-xs text-brand-brown/50">마음의 기도 제목을 보내주시면 함께 기도하겠습니다.</p>
                </div>
                <button
                  onClick={() => onClose()}
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-brown hover:bg-brand-sage hover:text-white transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {isSubmitted? (
                  <motion.div
                    initial={{ opacity: 0,scale: 0.8 }}
                    animate={{ opacity: 1,scale: 1 }}
                    className="text-center py-12 px-4 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-brand-sage/10 text-brand-sage rounded-full flex items-center justify-center mb-6">
                      <Heart className="w-8 h-8 fill-brand-sage text-brand-sage" />
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-brand-brown mb-3">소중한 기도가 접수되었습니다</h4>
                    <p className="text-brand-brown/70 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                      익명 또는 남겨주신 마음 그대로, 영신교회 교역자들이 소중히 마음을 모아 기도하겠습니다.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        setIsSubmitted(false);
                      }}
                      className="bg-brand-brown text-white hover:bg-brand-sage px-8 py-3 rounded-full text-sm font-medium transition-all shadow-lg active:scale-95"
                    >
                      닫기
                    </button>
                  </motion.div>
                ):(
                  <form onSubmit={handlePrayerSubmit} className="space-y-5">
                    {/* Anonymous Toggle */}
                    <div>
                      <label className="text-xs font-semibold text-brand-brown/70 block mb-2">작성 방식</label>
                      <div className="grid grid-cols-2 gap-2 bg-brand-gold/10 p-1.5 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setIsAnonymous(true)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${isAnonymous
                              ? 'bg-brand-brown text-white shadow-md'
                              :'text-brand-brown/60 hover:text-brand-brown'
                            }`}
                        >
                          무기명 (익명 기재)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAnonymous(false)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${!isAnonymous
                              ? 'bg-brand-brown text-white shadow-md'
                              :'text-brand-brown/60 hover:text-brand-brown'
                            }`}
                        >
                          기명 (이름 기재)
                        </button>
                      </div>
                    </div>

                    {/* Name field (conditional) */}
                    {!isAnonymous&&(
                      <motion.div
                        initial={{ opacity: 0,y: -10 }}
                        animate={{ opacity: 1,y: 0 }}
                        className="space-y-1.5"
                      >
                        <label className="text-xs font-semibold text-brand-brown/70 block">이름</label>
                        <input
                          type="text"
                          required={!isAnonymous}
                          value={prayerName}
                          onChange={(e) => setPrayerName(e.target.value)}
                          placeholder="기도요청자 성함을 입력해 주세요"
                          className="w-full bg-white border border-brand-gold/20 rounded-2xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage/20 transition-all placeholder:text-brand-brown/30"
                        />
                      </motion.div>
                    )}

                    {/* Contact field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-brown/70 block flex justify-between">
                        <span>연락처</span>
                        <span className="text-brand-brown/40 font-normal text-2xs">답변이나 기도가 필요한 경우 기재</span>
                      </label>
                      <input
                        type="tel"
                        value={prayerContact}
                        onChange={(e) => setPrayerContact(e.target.value)}
                        placeholder="예: 010-1234-5678"
                        className="w-full bg-white border border-brand-gold/20 rounded-2xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage/20 transition-all placeholder:text-brand-brown/30"
                      />
                    </div>

                    {/* Prayer Topic Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-brown/70 block">기도 분야</label>
                      <select
                        value={prayerTopic}
                        onChange={(e) => setPrayerTopic(e.target.value)}
                        className="w-full bg-white border border-brand-gold/20 rounded-2xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage/20 transition-all cursor-pointer"
                      >
                        <option value="영적 성장 및 믿음">영적 성장 및 믿음</option>
                        <option value="가정과 자녀">가정과 자녀</option>
                        <option value="건강 및 치유">건강 및 치유</option>
                        <option value="직장과 사업/진로">직장과 사업/진로</option>
                        <option value="기타 기도제목">기타 기도제목</option>
                      </select>
                    </div>

                    {/* Prayer Content */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-brown/70 block">기도 내용</label>
                      <textarea
                        required
                        rows={4}
                        value={prayerContent}
                        onChange={(e) => setPrayerContent(e.target.value)}
                        placeholder="함께 기도가 필요한 고충이나 소중한 기도제목을 적어주세요. 저희 동역자들이 함께 간절히 기도하겠습니다."
                        className="w-full bg-white border border-brand-gold/20 rounded-2xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage/20 transition-all resize-none placeholder:text-brand-brown/30 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-brand-brown hover:bg-brand-sage text-white rounded-2xl text-sm font-semibold transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-white text-white" />
                      기도 요청하기
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
    </AnimatePresence>
  );
}
