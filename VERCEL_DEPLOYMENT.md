# Vercel 배포 설정

## 1. Vercel Blob 연결

Vercel 프로젝트의 **Storage → Blob → Connect Store**에서 Blob 저장소를 연결합니다. 연결하면 `BLOB_READ_WRITE_TOKEN`이 프로젝트 환경 변수에 자동으로 추가됩니다.

## 2. 외부 ONLYOFFICE 연결

Vercel은 Docker 컨테이너를 함께 실행하지 않으므로, ONLYOFFICE Document Server를 별도 VPS나 ONLYOFFICE Cloud에 배포해야 합니다.

Vercel 환경 변수에 다음 값을 등록합니다.

```text
NEXT_PUBLIC_ONLYOFFICE_URL=https://office.example.com
```

주소 끝에는 `/`를 붙이지 않습니다. `https://office.example.com/web-apps/apps/api/documents/api.js`가 외부에서 열려야 합니다.

## 3. 재배포

환경 변수를 추가한 뒤 Vercel에서 새 배포를 실행합니다. 배포 환경에서는 DOCX를 브라우저에서 Vercel Blob으로 직접 업로드하므로 함수 요청 크기 제한을 우회합니다. HWP/HWPX 자동 변환은 별도 변환 서버 구성이 필요하므로 배포 환경에서는 DOCX 사용을 권장합니다.

> 현재 Blob은 ONLYOFFICE 서버가 파일을 내려받을 수 있도록 공개 URL 방식입니다. 민감한 연구문서를 운영 서비스에서 다룰 때는 비공개 Blob과 서명 URL, 사용자별 접근 제어를 추가해야 합니다.
