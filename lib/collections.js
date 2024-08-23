export const collections = [
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Sensei", address:"GMoemLuVAksjvGph8dmujuqijWsodt7nJsvwoMph3uzj", url:"sensei.webp"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
  {name:"Namaste", address:"ABFpGsZBHdfsst5HoCdHXfV17eNEP6cQAFqpV3HApUYi", url:"namaste.png"},
]

export const searchInCollection = (value) => {
  if(value == "") return collections;
  const result = collections.reduce((acc, cur, index) => {
    if(cur.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())) acc.push(cur);
    return acc;
  },[]);
  return result;
}