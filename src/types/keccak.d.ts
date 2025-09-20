declare module 'keccak' {
  interface KeccakHash {
    update(data: Buffer | string): KeccakHash;
    digest(): Buffer;
  }
  function keccak(algorithm: string): KeccakHash;
  export = keccak;
}
