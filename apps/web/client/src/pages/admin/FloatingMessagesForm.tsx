import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Settings } from "lucide-react";

interface FormField {
  fieldName: string;
  fieldType: "text" | "email" | "phone" | "select" | "textarea";
  fieldLabel: string;
  isRequired: boolean;
  displayOrder: number;
  selectOptions?: string[];
  placeholder?: string;
}

export default function AdminFloatingMessagesForm() {
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<"text" | "email" | "phone" | "select" | "textarea">("text");
  const [fieldLabel, setFieldLabel] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [placeholder, setPlaceholder] = useState("");
  const [selectOptions, setSelectOptions] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const { data: messages } = useQuery({
    queryKey: ["floating-messages"],
    queryFn: () => api.get<any[]>("/floating-messages"),
  });

  const resetFieldForm = () => {
    setFieldName("");
    setFieldType("text");
    setFieldLabel("");
    setIsRequired(true);
    setPlaceholder("");
    setSelectOptions("");
    setEditingFieldIndex(null);
    setIsEditingField(false);
  };

  const handleAddField = () => {
    if (!fieldName.trim() || !fieldLabel.trim()) {
      toast.error("필드 이름과 라벨을 입력해주세요");
      return;
    }
    if (fieldType === "select" && !selectOptions.trim()) {
      toast.error("선택 옵션을 입력해주세요");
      return;
    }

    const newField: FormField = {
      fieldName,
      fieldType,
      fieldLabel,
      isRequired,
      displayOrder: isEditingField && editingFieldIndex !== null ? editingFieldIndex : formFields.length,
      selectOptions: fieldType === "select" ? selectOptions.split("\n").filter((o) => o.trim()) : undefined,
      placeholder,
    };

    if (isEditingField && editingFieldIndex !== null) {
      const updated = [...formFields];
      updated[editingFieldIndex] = newField;
      setFormFields(updated);
    } else {
      setFormFields([...formFields, newField]);
    }

    resetFieldForm();
  };

  const handleEditField = (index: number) => {
    const field = formFields[index];
    setFieldName(field.fieldName);
    setFieldType(field.fieldType);
    setFieldLabel(field.fieldLabel);
    setIsRequired(field.isRequired);
    setPlaceholder(field.placeholder || "");
    setSelectOptions(field.selectOptions?.join("\n") || "");
    setEditingFieldIndex(index);
    setIsEditingField(true);
  };

  const handleDeleteField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSaveFormFields = async () => {
    if (!selectedMessageId) {
      toast.error("메시지를 선택해주세요");
      return;
    }
    if (formFields.length === 0) {
      toast.error("최소 하나의 필드를 추가해주세요");
      return;
    }
    toast.info("폼 필드 저장 기능은 현재 준비 중입니다");
  };

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessageId(messageId);
    setFormFields([]);
    resetFieldForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">플로팅 메시지 폼 설정</h1>
          <p className="text-muted-foreground mt-2">플로팅 메시지에 동적 폼 필드를 추가하세요</p>
        </div>
      </div>

      <Card className="elegant-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            메시지 선택
          </CardTitle>
          <CardDescription>폼 필드를 추가할 플로팅 메시지를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleSelectMessage(message.id)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    selectedMessageId === message.id ? "bg-primary/10 border-primary" : "hover:bg-muted border-border"
                  }`}
                >
                  <p className="font-medium">{message.title}</p>
                  <p className="text-sm text-muted-foreground">{message.content.substring(0, 50)}...</p>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">먼저 플로팅 메시지를 생성해주세요</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMessageId && (
        <Card className="elegant-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>폼 필드 관리</CardTitle>
                <CardDescription>방문자가 입력할 필드를 설정하세요</CardDescription>
              </div>
              <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetFieldForm()}><Plus className="mr-2 h-4 w-4" />필드 추가</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{isEditingField ? "필드 수정" : "새 필드 추가"}</DialogTitle>
                    <DialogDescription>폼에 표시될 필드를 설정하세요</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fieldName">필드 이름 (영문)</Label>
                      <Input id="fieldName" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="예: name, email, phone" />
                    </div>
                    <div>
                      <Label htmlFor="fieldLabel">필드 라벨 (표시명)</Label>
                      <Input id="fieldLabel" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="예: 이름, 이메일, 연락처" />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">필드 타입</Label>
                      <Select value={fieldType} onValueChange={(v: any) => setFieldType(v)}>
                        <SelectTrigger id="fieldType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="email">이메일</SelectItem>
                          <SelectItem value="phone">전화번호</SelectItem>
                          <SelectItem value="select">선택 (드롭다운)</SelectItem>
                          <SelectItem value="textarea">긴 텍스트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {fieldType === "select" && (
                      <div>
                        <Label htmlFor="selectOptions">선택 옵션 (줄 단위)</Label>
                        <Textarea id="selectOptions" value={selectOptions} onChange={(e) => setSelectOptions(e.target.value)} placeholder={"옵션1\n옵션2\n옵션3"} rows={4} />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="placeholder">플레이스홀더</Label>
                      <Input id="placeholder" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="입력 예시" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="required" checked={isRequired} onCheckedChange={setIsRequired} />
                      <Label htmlFor="required">필수 입력</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)}>취소</Button>
                    <Button onClick={handleAddField}>{isEditingField ? "수정" : "추가"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {formFields.length > 0 ? (
              <div className="space-y-2">
                {formFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                    <div className="flex-1">
                      <p className="font-medium">{field.fieldLabel}</p>
                      <p className="text-sm text-muted-foreground">{field.fieldType} {field.isRequired && "· 필수"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditField(index)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteField(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">필드를 추가해주세요</p>
            )}
            {formFields.length > 0 && (
              <Button onClick={handleSaveFormFields} className="w-full mt-4">
                폼 필드 저장
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
