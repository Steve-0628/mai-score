import { S, G, M, A } from './type'
import { db } from '~/plugins/firestore'
import * as User from '~/store/user/type'
// ______________________________________________________
//
export const state = (): S => ({
  isAuthenticatedFlg: false,
  uid: '',
  providerData: [],
  filterOption: {
    difficultyLevel: ['Basic', 'Advanced', 'Expert', 'Master', 'ReMaster'],
    genre: [
      'niconico＆ボーカロイド',
      '東方Project',
      'ゲーム＆バラエティ',
      'maimai',
      'オンゲキ＆CHUNITHM',
      'POPS＆アニメ'
    ],
    version: [
      'maimai',
      'maimai_PLUS',
      'GreeN',
      'GreeN_PLUS',
      'ORANGE',
      'ORANGE_PLUS',
      'PiNK',
      'PiNK_PLUS',
      'MURASAKi',
      'MURASAKi_PLUS',
      'MiLK',
      'MiLK_PLUS',
      'FiNALE',
      'maimaiでらっくす',
      'maimaiでらっくす_PLUS'
    ],
    level: [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      7.5,
      8,
      8.5,
      9,
      9.5,
      10,
      10.5,
      11,
      11.5,
      12,
      12.5,
      13,
      13.5,
      14,
      14.5,
      15
    ],
    type: ['deluxe', 'standard'],
    showColumn: [
      'title',
      'genre',
      'version',
      'difficultyLevel',
      'level',
      'type',
      'achievement',
      'rank',
      'dxScore',
      'maxDxScore',
      'comboRank',
      'sync',
      'date'
    ]
  }
})
// ______________________________________________________
//
export const getters: {
  [K in keyof G]: (
    state: S,
    getters: G,
    rootState: any,
    rootGetters: any
  ) => G[K]
} = {
  //
}
// ______________________________________________________
//
export const mutations: {
  [K in keyof M]: (state: S, payload: M[K]) => void
} = {
  isAuthenticatedFlgChange(state: any, authFlg: any) {
    state.isAuthenticatedFlg = authFlg
  },
  setUID(state: any, uid: any) {
    state.uid = uid
  },
  setProviderData(state: any, providerData: any) {
    state.providerData = providerData
  },
  setFilterOption(state: any, filterOption: any) {
    state.filterOption = JSON.parse(JSON.stringify(filterOption))
  }
}
// ______________________________________________________
//
export const actions: {
  [K in keyof A]: (
    ctx: {
      commit: <T extends keyof M>(type: T, payload?: M[T]) => void
      dispatch: <T extends keyof A>(type: T, payload?: A[T]) => any
      state: S
      getters: G
      rootState: {
        user: User.S
      }
      rootGetters: User.RG
    },
    payload: A[K]
  ) => any
} = {
  async setUser(ctx: any, user: any) {
    const providerData = user.providerData.map((v: any) => {
      return { ...v }
    }) as firebase.UserInfo[]

    try {
      const doc = await db
        .collection('users')
        .doc(user.uid)
        .get()

      if (!doc.exists) {
        const date = Date.now()
        await db
          .collection('users')
          .doc(user.uid)
          .set(
            {
              public: false,
              displayName: ''
            },
            { merge: true }
          )
        await db
          .collection('users')
          .doc(user.uid)
          .collection('secure')
          .doc(user.uid)
          .set({
            userID: user.uid,
            email: user.email,
            providerData,
            isDXScoreNotOnTheTweetImg: false, // デフォルトで画像にでらっくスコアのみの更新でも乗っける
            _createdAt: date,
            _updateAt: date
          })
      } else {
        await db
          .collection('users')
          .doc(user.uid)
          .collection('secure')
          .doc(user.uid)
          .set(
            {
              email: user.email,
              providerData
            },
            { merge: true }
          )
      }
      ctx.commit('isAuthenticatedFlgChange', true)
      ctx.commit('setUID', user.uid)
      ctx.commit('setProviderData', providerData)
    } catch (error) {
      console.error(error)
    }
  },
  logout(ctx: any) {
    ctx.commit('isAuthenticatedFlgChange', false)
    ctx.commit('setUID', '')
  },
  async saveTwitterToken(ctx: any, credential: any) {
    await db
      .collection('users')
      .doc(ctx.state.uid)
      .collection('secure')
      .doc(ctx.state.uid)
      .set(
        {
          accessToken: credential.accessToken,
          secret: credential.secret
        },
        { merge: true }
      )
  }
}
