const fetchCreatorArrayCollection = async (creatorAddress, marketplace, hashlist) => {
  let page = 1
  let mintList = []
  let holderList = []
  let noMarketplaceHolderList = []
  while (page) {
    const response = await fetch(secureRPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: creatorAddress,
          onlyVerified: true,
          page: page,
          limit: 1000,
        },
      }),
    })
    const { result } = await response.json()
    for (const nfts of result.items) {
      if (nfts.burnt === false) {
        mintList.push(nfts.id)
        holderList.push(nfts.ownership.owner)
      }
    }
    if (result.total !== 1000) {
      page = false
    } else {
      page++
    }
  }
  if (hashlist) {
    return mintList
  }
  if (marketplace) {
    for (const holderAddress of holderList) {
      let blacklisted = false
      for (const blacklistedAddress of blacklistedMarketplaceOwners) {
        if (blacklistedAddress === holderAddress) {
          blacklisted = true
        }
      }
      if (!blacklisted) {
        noMarketplaceHolderList.push(holderAddress)
      }
    }
    return noMarketplaceHolderList
  } else {
    return holderList
  }
}
const fetchMCC = async (creatorAddress, marketplace, hashlist) => {
  let page = 1
  let mintList = []
  let holderList = []
  let noMarketplaceHolderList = []
  while (page) {
    const response = await fetch(secureRPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByGroup",
        params: {
          groupKey: 'collection',
          groupValue: creatorAddress,
          page: page,
          limit: 1000,
        },
      }),
    })
    const { result } = await response.json()
    for (const nfts of result.items) {
      if (nfts.burnt === false) {
        mintList.push(nfts.id)
        holderList.push(nfts.ownership.owner)
      }
    }
    if (result.total !== 1000) {
      page = false
    } else {
      page++
    }
  }
  if (hashlist) {
    return mintList
  }
  if (marketplace) {
    for (const holderAddress of holderList) {
      let blacklisted = false
      for (const blacklistedAddress of blacklistedMarketplaceOwners) {
        if (blacklistedAddress === holderAddress) {
          blacklisted = true
        }
      }
      if (!blacklisted) {
        noMarketplaceHolderList.push(holderAddress)
      }
    }
    return noMarketplaceHolderList
  } else {
    return holderList
  }
}
const blacklistedMarketplaceOwners = [
  "4zdNGgAtFsW1cQgHqkiWyRsxaAgxrSRRynnuunxzjxue",
  "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
]