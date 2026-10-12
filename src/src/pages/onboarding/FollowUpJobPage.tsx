import { Link, useNavigate } from 'react-router-dom'
import FirstFollowUps from './FirstFollowUps'

/** The same first job remains reachable after account/model/connection setup in Home. */
export default function FollowUpJobPage() {
  const navigate = useNavigate()
  return <main className="h-full overflow-auto bg-white p-6 sm:p-10"><div className="mx-auto max-w-2xl">
    <Link className="underline" to="/home">Back to Home</Link>
    <FirstFollowUps onFinish={async () => { navigate('/home') }} onConfigure={() => navigate('/home')} />
  </div></main>
}
