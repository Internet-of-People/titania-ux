import Vue from 'vue'
import Vuex from 'vuex'
import VueSession from 'vue-session'
import api from './api.js'
import router from '../router'

Vue.use(Vuex)
Vue.use(VueSession)

const apiRoot = 'http://127.0.0.1:8000'  // This will change if you deploy later

const store = new Vuex.Store({
  state: {
    schema: '',
    credentials: {
      username: '',
      password: ''
    },
    configuration: {
      enableConfigure: false
    },
    currentPage: 'dashboard',
    series: [],
    dashboardChart: {
      series: [],
      seriesname: []
    },
    dockeroverview: [],
    dockerstats: []
  },
  mutations: {
    // Keep in mind that response is an HTTP response
    // returned by the Promise.
    // The mutations are in charge of updating the client state.
    'SET_SCHEMA': function (state, response) {
      state.schema = response.body[0].version
    },
    'GET_CREDS': function (state, response) {
      if (response.body.length === 0) {
        router.push('/configure')
        state.currentPage = 'configure'
      } else {
        router.push('/login')
        state.currentPage = 'login'
      }
    },
    'TOGGLE_CONFIGURATION': function (state) {
      state.configuration.enableConfigure = !state.configuration.enableConfigure
    },
    'SAVE_CONFIGURATION': function (state, response) {
      router.push('/login')
      state.currentPage = 'login'
    },
    'LOGIN': function (state, response) {
      if (response.body.STATUS === 'SUCCESS') {
        Vue.toast('Login successful', {
          id: 'my-toast',
          className: ['toast-success'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          duration: 2000,
          mode: 'queue',
          transition: 'my-transition'
        })
        router.push({name: 'dashboard', params: { setSession: true }})
        state.currentPage = 'dashboard'
        state.credentials.username = response.body.username
      } else {
        Vue.toast('Login attempt failed', {
          id: 'my-toast',
          className: ['toast-warning'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          duration: 4000,
          mode: 'queue',
          transition: 'my-transition'
        })
      }
    },
    'LOGOUT': function (state, response) {
      if (response.body.STATUS === 'SUCCESS') {
        Vue.toast('Logged out successfully', {
          id: 'my-toast',
          className: ['toast-success'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          duration: 2000,
          mode: 'queue'
        })
        router.push('/login')
        state.currentPage = 'login'
        state.credentials.username = ''
      }
    },
    'DASHBOARD_DETAILS': function (state, response) {
      state.currentPage = 'dashboard'
      state.series = response.body
    },
    'DASHBOARD_CHART_INIT': function (state, response) {
      // works for one docker component
      var iniSeries = response.body
      var newSeries = []
      var newSeriesName = []
      for (var i = 0; i < iniSeries.length; i++) {
        newSeriesName.push(iniSeries[i].container_name)
        newSeries.push(iniSeries[i].data)
      }
      state.dashboardChart.seriesname = newSeriesName
      state.dashboardChart.series = newSeries
    },
    // Note that we added one more for logging out errors.
    'API_FAIL': function (state, error) {
      console.error(error)
    },
    'SET_CURRENT_PAGE': function (state, pageName) {
      state.currentPage = pageName
    },
    'DOCKER_OVERVIEW': function (state, response) {
      state.dockeroverview = response.body
    },
    'DOCKER_STATS': function (state, response) {
      state.dockerstats = response.body
    }
  },
  actions: {
    initApp (state) {
      var getSchema = {
        _action: 'getSchema'
      }
      return api.post(apiRoot + '/index.html', getSchema)
        .then(function (response) {
          store.commit('SET_SCHEMA', response)
          store.dispatch('getCreds')
        }).catch((error) => store.commit('API_FAIL', error))
    },
    getCreds (state) {
      var getUserDetails = {
        _action: 'getUserDetails'
      }
      return api.post(apiRoot + '/index.html', getUserDetails)
        .then((response) => store.commit('GET_CREDS', response))
        .catch((error) => store.commit('API_FAIL', error))
    },
    login (state, credentials) {
      var login = {
        _action: 'login',
        username: credentials.username,
        password: credentials.password
      }
      return api.post(apiRoot + '/index.html', login)
        .then((response) => store.commit('LOGIN', response))
        .catch((error) => store.commit('API_FAIL', error))
      // write code to check session id, store it in backend
    },
    toggleConfigForm (state) {
      store.commit('TOGGLE_CONFIGURATION')
    },
    saveConfigForm (state, configdetails) {
      configdetails._action = 'saveUserDetails'
      return api.post(apiRoot + '/index.html', configdetails)
        .then((response) => store.commit('SAVE_CONFIGURATION', configdetails))
        .catch((error) => store.commit('API_FAIL', error))
    },
    logout (state, credentials) {
      var logout = {
        _action: 'logout',
        username: credentials.username
      }
      return api.post(apiRoot + '/index.html', logout)
        .then((response) => store.commit('LOGOUT', response))
        .catch((error) => store.commit('API_FAIL', error))
    },
    getDashboardCards (state) {
      var logout = {
        _action: 'getDashboardCards'
      }
      return api.post(apiRoot + '/index.html', logout)
        .then((response) => store.commit('DASHBOARD_DETAILS', response))
        .catch((error) => store.commit('API_FAIL', error))
    },
    getDashboardChart (state) {
      var logout = {
        _action: 'getDashboardChart'
      }
      return api.post(apiRoot + '/index.html', logout)
        .then((response) => store.commit('DASHBOARD_CHART_INIT', response))
        .catch((error) => store.commit('API_FAIL', error))
    },
    switchDrilldown (state, tabname) {
      store.commit('SET_CURRENT_PAGE', tabname)
    },
    getDockerOverview (state) {
      var logout = {
        _action: 'getDockerOverview'
      }
      return api.post(apiRoot + '/index.html', logout)
      .then((response) => store.commit('DOCKER_OVERVIEW', response))
      .catch((error) => store.commit('API_FAIL', error))
    },
    getContainerStats (state) {
      var logout = {
        _action: 'getContainerStats'
      }
      return api.post(apiRoot + '/index.html', logout)
      .then((response) => store.commit('DOCKER_STATS', response))
      .catch((error) => store.commit('API_FAIL', error))
    }
  }
})

export default store
