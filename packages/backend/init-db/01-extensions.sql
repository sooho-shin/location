-- =============================================
-- Location Backend 데이터베이스 초기화 스크립트
-- Docker 컨테이너 최초 생성 시 자동으로 실행됩니다
-- =============================================

-- PostGIS 확장 설치 (지리 공간 데이터 처리)
CREATE EXTENSION IF NOT EXISTS postgis;

-- pgvector 확장 설치 (벡터 유사도 검색)
CREATE EXTENSION IF NOT EXISTS vector;

-- 설치된 확장 확인 로그
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '데이터베이스 초기화 완료!';
    RAISE NOTICE '- PostGIS: 지리 공간 데이터 지원';
    RAISE NOTICE '- pgvector: 벡터 유사도 검색 지원';
    RAISE NOTICE '========================================';
END $$;
