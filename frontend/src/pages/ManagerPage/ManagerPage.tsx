import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 
import http from "../../api/http"; 

// === [타입 정의] ===
interface ProjectDto {
  id: number;
  title: string;
  status: string;
  updatedAt: string;
}

interface AuditLogDto {
  id: number;
  userName: string;
  action: string;
  targetDocument: string;
  timestamp: string;
}

const ManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  
  // 데이터 상태
  const [myProjects, setMyProjects] = useState<ProjectDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setRole(decoded.role); 
        fetchRoleData(decoded.role);
      } catch (e) {
        console.error("토큰 오류", e);
      }
    }
  }, []);

  const fetchRoleData = async (userRole: string) => {
    setLoading(true);
    try {
      if (userRole === "MEMBER") {
        const res = await http.get("/api/mypage/projects");
        setMyProjects(res.data);
      } else if (userRole === "ADMIN") {
        const res = await http.get("/api/mypage/audit-logs");
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>{role === "ADMIN" ? "관리자 대시보드" : "마이페이지"}</Title>
          <HeaderBtn onClick={() => navigate("/resetPassword")}>
            🔒 비밀번호 변경
          </HeaderBtn>
        </Header>

        <ContentSection>
          {/* ▼▼▼ 여기 텍스트를 수정했습니다 ▼▼▼ */}
          <SectionTitle>
            {role === "ADMIN" ? "🛡️ 전체 보안 감사 로그" : "📂 진행 중인 공고"}
          </SectionTitle>

          <ContentArea>
            {loading && <LoadingText>데이터를 불러오는 중입니다...</LoadingText>}

            {/* [CASE 1] 일반 멤버 화면 */}
            {role === "MEMBER" && !loading && (
              <Table>
                <thead>
                  <tr>
                    {/* ▼▼▼ 테이블 헤더도 수정했습니다 ▼▼▼ */}
                    <th style={{width: '50%'}}>공고명</th>
                    <th>상태</th>
                    <th>최근 수정일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.length === 0 ? (
                    <tr><td colSpan={4} className="empty">진행 중인 공고가 없습니다.</td></tr>
                  ) : (
                    myProjects.map((proj) => (
                      <tr key={proj.id}>
                        <td style={{ fontWeight: "500" }}>{proj.title}</td>
                        <td><StatusBadge status={proj.status}>{proj.status}</StatusBadge></td>
                        <td>{new Date(proj.updatedAt).toLocaleDateString()}</td>
                        <td>
                          <ActionButton onClick={() => alert(`'${proj.title}' 공고 작업 계속하기`)}>
                            작업 계속
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}

            {/* [CASE 2] 관리자 화면 (그대로 유지) */}
            {role === "ADMIN" && !loading && (
              <Table>
                <thead>
                  <tr>
                    <th style={{width: '20%'}}>발생 시간</th>
                    <th style={{width: '15%'}}>사용자</th>
                    <th style={{width: '15%'}}>활동(Action)</th>
                    <th>대상 문서 / 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={4} className="empty">로그 내역이 없습니다.</td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: "bold", color: "#4b5563" }}>{log.userName}</td>
                        <td>
                          <ActionBadge action={log.action}>{log.action}</ActionBadge>
                        </td>
                        <td>{log.targetDocument}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </ContentArea>
        </ContentSection>
      </Container>
    </PageWrapper>
  );
};

export default ManagerPage;

/* ===== 스타일 정의 (기존과 동일) ===== */
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  padding: 40px 0;
  box-sizing: border-box;
`;

const Container = styled.div`
  width: 1000px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const HeaderBtn = styled.button`
  background: #fff;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #111;
  }
`;

const ContentSection = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
`;

const ContentArea = styled.div`
  min-height: 300px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: #6b7280;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: #f9fafb;
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
  }
  td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: middle;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background-color: #f9fafb;
  }
  .empty {
    text-align: center;
    padding: 80px;
    color: #9ca3af;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === "완료" ? "#d1fae5" : "#eff6ff"};
  color: ${props => props.status === "완료" ? "#047857" : "#1d4ed8"};
`;

const ActionBadge = styled.span<{ action: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  background: ${props => 
    props.action === "LOGIN" ? "#f3f4f6" : 
    props.action === "DOWNLOAD" ? "#fee2e2" : "#fef3c7"};
  color: ${props => 
    props.action === "LOGIN" ? "#4b5563" : 
    props.action === "DOWNLOAD" ? "#b91c1c" : "#b45309"};
`;

const ActionButton = styled.button`
  padding: 6px 14px;
  border: 1px solid #3b82f6;
  background: #fff;
  color: #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
  }
`;