import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UseCRUDOptions {
  /** React Query 캐시 키 — useQuery의 queryKey[0]과 일치시켜야 합니다 */
  queryKey: string;
  /** API 리소스 경로 (앞의 슬래시 제외), 예: "videos" */
  path: string;
  /** 토스트 메시지에 사용할 엔티티 이름, 예: "영상" */
  entityName: string;
  /** 생성·수정 성공 후 호출됩니다 (다이얼로그 닫기, 폼 초기화 등) */
  onSuccess?: () => void;
}

/**
 * 어드민 CRUD 페이지마다 반복되는 생성·수정·삭제 뮤테이션 패턴을 공통화한 훅입니다.
 * 캐시 무효화와 토스트 피드백을 자동으로 처리합니다.
 *
 * 사용 예:
 *   const { createMutation, updateMutation, confirmDelete } = useCRUD({
 *     queryKey: "videos", path: "videos", entityName: "영상",
 *     onSuccess: () => { resetForm(); setDialogOpen(false); },
 *   });
 */
export function useCRUD({ queryKey, path, entityName, onSuccess }: UseCRUDOptions) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.post(`/${path}`, data),
    onSuccess: () => {
      invalidate();
      toast.success(`${entityName}이 등록되었습니다`);
      onSuccess?.();
    },
    onError: (err: any) => toast.error(`오류: ${err.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/${path}/${id}`, data),
    onSuccess: () => {
      invalidate();
      toast.success(`${entityName}이 수정되었습니다`);
      onSuccess?.();
    },
    onError: (err: any) => toast.error(`오류: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/${path}/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success(`${entityName}이 삭제되었습니다`);
    },
    onError: (err: any) => toast.error(`오류: ${err.message}`),
  });

  const confirmDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate(id);
  };

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    confirmDelete,
  };
}
