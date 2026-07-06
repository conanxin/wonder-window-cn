import { useState } from 'react'

export function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('已加入万物小窗，下一期见。')
    setEmail('')
  }

  return (
    <div className="subscribe-box">
      <div>
        <span className="section-kicker">订阅模拟</span>
        <h2>每周给自己留一扇窗</h2>
        <p>
          输入邮箱即可看到订阅反馈。这个演示不连接外部服务，也不会保存数据。
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">邮箱</label>
        <div className="subscribe-row">
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="button primary" type="submit">
            加入
          </button>
        </div>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </div>
  )
}
