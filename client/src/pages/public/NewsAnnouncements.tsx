import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, Download, FileText, Search, X } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { DEFAULT_NOTICE_POSTS } from "@/data/siteContent";
import { noticesContent } from "@/content/news";

const NOTICE_POSTS = DEFAULT_NOTICE_POSTS;
const NOTICE_PAGE_SIZE = 6;

export default function NewsAnnouncements() {
  const [noticeFilter, setNoticeFilter] = useState("전체");
  const [noticeSearch, setNoticeSearch] = useState("");
  const [visibleNoticeCount, setVisibleNoticeCount] = useState(NOTICE_PAGE_SIZE);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [noticeDownloadStatus, setNoticeDownloadStatus] = useState<Record<number, string>>({});
  return (
    <PublicPageLayout>
      <>
        <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
          {/* Notice Hero Section */}
          <div className="subpage-hero info-hero relative h-[25vh] md:h-[23vh] w-full overflow-hidden">
            <img
              src={noticesContent.hero.image}
              alt={noticesContent.hero.imageAlt}
              className="w-full h-full object-cover brightness-[0.7]"
              style={{ objectPosition: '0 87%' }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
              <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-6 md:pb-8 flex justify-between items-end">
                <div className="text-left">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E4C59E] text-brand-brown text-sm font-bold tracking-wider mb-2">
                    {noticesContent.hero.eyebrow}
                  </span>
                  <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2"><span className="subpage-title-mobile">{noticesContent.hero.title}</span><span className="subpage-title-desktop">{noticesContent.hero.titleDesktop}</span></h1>
                  <p className="hidden md:block text-white/80 text-base md:text-lg font-light max-w-[var(--reading-max)] mt-1 leading-relaxed">
                    {noticesContent.hero.description}
                  </p>
                </div>
                <button
                  onClick={() => { window.location.href='/'; }}
                  className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>뒤로 가기</span>
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-[var(--content-max)] mx-auto px-6 mt-8">
            {/* Filter and Search header Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Category selector */}
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {noticesContent.filters.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoticeFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${noticeFilter===cat
                        ? 'bg-brand-sage/25 text-brand-brown ring-1 ring-brand-sage/40'
                        :'bg-brand-sage/10 text-brand-brown/70 hover:bg-brand-sage/20'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-brand-brown/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목이나 소식 검색..."
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 border border-brand-gold/25 focus:border-brand-sage rounded-full outline-none bg-brand-cream/10 text-brand-brown transition-colors"
                />
                {noticeSearch&&(
                  <button
                    onClick={() => setNoticeSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brand-brown/40 hover:text-brand-brown"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            {/* Gallery list for Bulletins / Posters */}
            {(() => {
              const filtered=NOTICE_POSTS.filter(notice => {
                const matchesSearch=notice.title.toLowerCase().includes(noticeSearch.toLowerCase())||
                  notice.desc.toLowerCase().includes(noticeSearch.toLowerCase());
                if(noticeFilter==='전체') return matchesSearch;
                return notice.category===noticeFilter&&matchesSearch;
              });

              if(filtered.length===0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-brand-gold/15 mt-8 text-center text-brand-brown/50">
                    <FileText className="w-10 h-10 text-brand-gold/30 mx-auto mb-2" />
                    <p className="text-base font-medium">검색 결과에 맞는 공지사항이나 주보가 없습니다.</p>
                    <p className="text-sm text-brand-brown/40 mt-1">다른 검색어를 입력해 보시거나 필터를 변경해 보세요.</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-10 mt-8">
                  <div className="notice-card-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    {filtered.slice(0, visibleNoticeCount).map((item) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0,y: 10 }}
                        animate={{ opacity: 1,y: 0 }}
                        key={item.id}
                        className="bg-white rounded-3xl overflow-hidden border border-brand-gold/15 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
                      >
                        <div>
                          {/* Card Image */}
                          <div className="relative h-48 w-full overflow-hidden bg-brand-cream/20">
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 flex gap-1">
                              <span className={`px-2 py-1 text-2xs font-bold rounded-lg text-white ${item.category==='주보'? 'bg-brand-sage':'bg-brand-gold'
                                }`}>
                                {item.category}
                              </span>
                              <span className="bg-black/40 backdrop-blur-md px-2 py-1 text-2xs font-medium text-white rounded-lg">
                                {item.date}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5">
                            <h3 className="board-card-title font-serif font-bold text-brand-brown leading-snug line-clamp-2 hover:text-brand-sage transition-colors">
                              {item.title}
                            </h3>
                            <p className="board-card-description text-brand-brown/70 font-light mt-2 leading-relaxed line-clamp-3">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        {/* Card Action footer */}
                        <div className="px-5 pb-8 pt-2 border-t border-brand-gold/10 flex items-center justify-between">
                          <span className="text-2xs text-brand-brown/40 font-mono">
                            조회/다운: {item.downloads}회
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Simulate Document Download with user feedback
                                setNoticeDownloadStatus(prev => ({ ...prev,[item.id]: '준비중...' }));
                                setTimeout(() => {
                                  // Increment download count
                                  setNoticeDownloadStatus(prev => ({ ...prev,[item.id]: '완료 ✓' }));

                                  // Reset status text after 2 seconds
                                  setTimeout(() => {
                                    setNoticeDownloadStatus(prev => {
                                      const next={ ...prev };
                                      delete next[item.id];
                                      return next;
                                    });
                                  },2000);
                                },1100);
                              }}
                              className="notice-card-action flex items-center gap-1 bg-brand-cream hover:bg-brand-sage hover:text-white border border-brand-gold/15 py-1.5 px-3 rounded-lg font-normal text-brand-brown transition-all cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              {noticeDownloadStatus[item.id]||'PDF 저장'}
                            </button>

                            <button
                              onClick={() => setSelectedNoticeId(item.id)}
                              className="notice-card-action flex items-center gap-1 bg-brand-brown hover:bg-brand-sage text-white py-1.5 px-3 rounded-lg font-normal transition-all cursor-pointer"
                            >
                              <Search className="w-3 h-3" />
                              공지 확인
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Load More Button */}
                  {filtered.length > visibleNoticeCount && (
                    <div className="flex justify-center mt-2">
                      <button
                        type="button"
                        onClick={() => setVisibleNoticeCount((prev) => prev + NOTICE_PAGE_SIZE)}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-white border border-brand-gold/20 hover:border-brand-sage hover:bg-brand-sage/5 text-brand-brown hover:text-brand-sage text-sm font-medium transition-all cursor-pointer shadow-sm"
                      >
                        공지사항 및 주보 더보기 <ChevronDown className="w-4 h-4 animate-bounce" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Modal overlay for detailed Notice view */}
          {selectedNoticeId!==null&&(() => {
            const currentItem=NOTICE_POSTS.find(n => n.id===selectedNoticeId);
            if(!currentItem) return null;
            return (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0,scale: 0.95 }}
                  animate={{ opacity: 1,scale: 1 }}
                  className="bg-brand-cream max-w-2xl w-full rounded-2xl overflow-hidden border border-brand-gold/25 shadow-2xl relative text-left max-h-[90vh] flex flex-col"
                >
                  <button
                    onClick={() => setSelectedNoticeId(null)}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="overflow-y-auto overscroll-contain min-h-0 flex-1">
                    <div className="relative h-60 bg-black">
                      <img
                        src={currentItem.img}
                        alt={currentItem.title}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-6">
                        <span className="inline-block px-2.5 py-1 bg-brand-sage text-white self-start text-2xs font-bold rounded mb-1">{currentItem.category}</span>
                        <h2 className="notice-modal-title font-serif font-normal text-white leading-normal">{currentItem.title}</h2>
                        <p className="text-white/70 text-xs mt-1 font-mono">발행일자: {currentItem.date}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-brand-brown/50">상세 안내 사항</h4>
                        <p className="text-sm md:text-base text-brand-brown/85 mt-2 leading-relaxed whitespace-pre-line font-light">
                          {currentItem.desc}
                        </p>
                      </div>

                      {currentItem.img&&(
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-brand-brown/50">안내 포스터</h4>
                          <div className="bg-black/5 p-2 rounded-xl border border-brand-gold/10 flex justify-center">
                            <img
                              src={currentItem.img}
                              alt={`${currentItem.title} 포스터`}
                              className="max-h-[23.75rem] md:max-h-[31.25rem] w-auto object-contain rounded-lg shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-white rounded-xl border border-brand-gold/10 space-y-2">
                        <h4 className="text-xs font-bold text-brand-sage font-mono">Simulated PDF Attachment</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-brand-brown/70 truncate flex items-center gap-1">
                            <FileText className="w-4 h-4 text-[#A81E1E]" /> {currentItem.title.slice(0,18)}..._Bulletin.pdf
                          </span>
                          <button
                            onClick={() => {
                              // Show simulated download alert on the detail modal itself
                              setNoticeDownloadStatus(prev => ({ ...prev,[currentItem.id]: '저장완료' }));
                              setTimeout(() => {
                                setNoticeDownloadStatus(prev => {
                                  const next={ ...prev };
                                  delete next[currentItem.id];
                                  return next;
                                });
                              },1500);
                            }}
                            className="notice-modal-download text-xs text-brand-brown bg-brand-cream border border-brand-gold/20 hover:bg-brand-sage hover:text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            {noticeDownloadStatus[currentItem.id]||'다운로드'}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setSelectedNoticeId(null)}
                          className="px-5 py-2 bg-brand-brown hover:bg-brand-sage text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          문서 확인완료
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </div>
      </>
    </PublicPageLayout>
  );
}
