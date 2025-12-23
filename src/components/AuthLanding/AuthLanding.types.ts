/**
 * AuthLanding 컴포넌트 타입 정의
 */

export interface AuthLandingProps {
  onSignIn: () => Promise<void>
  loading: boolean
  error: string | null
  onClearError: () => void
}
