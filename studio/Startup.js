import {Component} from 'react'
import Studio from 'jsreport-studio'
import login from './login.js'
import style from './style.scss'

export default class Startup extends Component {
  constructor () {
    super()
    this.state = {userWorkspaces: [], popularWorkspaces: [], pinnedWorkspaces: [], tab: 'popular'}
  }

  async expandUsers (workspaces) {
    for (const w of workspaces) {
      const response = await Studio.api.get(`/odata/users('${w.userId}')`)
      if (response.value.length === 1) {
        w.user = response.value[0]
      }
    }
    return workspaces
  }

  async componentDidMount () {
    let userWorkspaces = []
    if (Studio.workspaces.user) {
      const userResponse = await Studio.api.get(`/odata/workspaces?$filter=user eq ${Studio.workspaces.user.id}`)
      userWorkspaces = await this.expandUsers(userResponse.value)
    }

    const popularResponse = await Studio.api.get(`/odata/workspaces?$orderBy=name&top=20`)
    const popularWorkspaces = await this.expandUsers(popularResponse.value)

    const pinnedResponse = await Studio.api.get(`/odata/workspaces?$filter=isPinned eq true&$orderBy=name&top=20`)
    const pinnedWorkspaces = await this.expandUsers(pinnedResponse.value)

    this.setState({ userWorkspaces, popularWorkspaces, pinnedWorkspaces })
  }

  renderTable (workspaces) {
    return <div>
      {workspaces.length === 0 ? 'Nothing here yet...'
        : <table className={'table ' + style.workspacesTable}>
          <thead>
            <tr>
              <th>name</th>
              <th>user</th>
              <th>modified</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => <tr key={w._id} onClick={() => Studio.workspaces.open(w)}>
              <td className='selection'>{w.name}</td>
              <td style={{color: '#007ACC'}} onClick={() => alert('here')}>{w.user ? w.user.fullName : ''}</td>
              <td>{w.modificationDate.toLocaleDateString()}</td>
              <td>{w.views || 0}<i className='fa fa-eye' /></td>
              <td>{w.likes || 0}<i className='fa fa-heart' /></td>
            </tr>)}
          </tbody>
        </table>}
    </div>
  }

  renderPinnedExamples () {
    return <div>
      {this.renderTable(this.state.pinnedWorkspaces)}
    </div>
  }

  renderPopularWorkspaces () {
    return <div>
      {this.renderTable(this.state.popularWorkspaces)}
    </div>
  }

  renderUserWorkspaces () {
    return Studio.workspaces.user ? this.renderForUser() : this.renderForAnonym()
  }

  renderForUser () {
    return <div>
      {this.renderTable(this.state.userWorkspaces)}
    </div>
  }

  renderForAnonym () {
    return <div>
      {login()}
    </div>
  }

  renderActions () {
    return <div>
      <h3>actions</h3>
      <div>
        <button className='button confirmation' onClick={() => Studio.workspaces.create()}>new workspace</button>
        <button className='button confirmation'>search</button>
      </div>
    </div>
  }

  renderTab () {
    switch (this.state.tab) {
      case 'examples': return <div>{this.renderPinnedExamples()}</div>
      case 'my': return <div>{this.renderUserWorkspaces()}</div>
      case 'popular': return <div>{this.renderPopularWorkspaces()}</div>
    }
  }

  render () {
    return <div className='custom-editor' style={{overflow: 'auto'}}>
      <div>
        {Studio.workspaces.user ? <h2>welcome {Studio.workspaces.user.fullName}</h2> : ''}
      </div>
      <div>
        <button className='button confirmation' onClick={() => this.props.close()}><i className='fa fa-plus-square' /> new</button>
      </div>
      <div className={style.tabs}>
        <div className={this.state.tab === 'examples' ? style.selectedTab : ''} onClick={() => this.setState({ tab: 'examples' })}>Examples</div>
        <div className={this.state.tab === 'my' ? style.selectedTab : ''} onClick={() => this.setState({ tab: 'my' })}>My workspaces</div>
        <div className={this.state.tab === 'popular' ? style.selectedTab : ''} onClick={() => this.setState({ tab: 'popular' })}>Popular workspaces</div>

        <div style={{marginLeft: 'auto'}}><i className='fa fa-plus-square' /></div>
        <div><i className='fa fa-search' /></div>
      </div>
      {this.renderTab()}
    </div>
  }
}
