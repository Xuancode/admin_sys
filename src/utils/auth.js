import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const ItemIndex = 'Item-Index'

/* token操作 */
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  Cookies.remove(TokenKey)
  return Cookies.remove(TokenKey)
}

/* 当前项目 */
export function getItemIndex() {
  return Cookies.get(ItemIndex)
}

export function setItemIndex(index) {
  return Cookies.set(ItemIndex, index)
}

export function removeItemIndex() {
  return Cookies.remove(ItemIndex)
}
