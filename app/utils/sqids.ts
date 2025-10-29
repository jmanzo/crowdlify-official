import Sqids from 'sqids';

export const _HashID = new Sqids({
  // TODO - 👇🏼 Use alphabet comming from an ENV
  alphabet: process.env.HASH_KEY,
  minLength: 6,
});

export const HashID = {
  decode: _HashID.decode,
  encode: _HashID.encode,
  decodeID: (hashID: string) => _HashID.decode(hashID)[0],
  encodeID: (id: number) => _HashID.encode([id]),
};
