export interface CreateDispenserInterface {
  flor_volume: number;
  price: number;
  brand: string;
  beerType: string;
}

export enum BeerType {
  Pilsen = 'pilsen',
  PaleAle = 'paleAle',
  Lager = 'lager',
  Stout = 'stout',
  Porter = 'porter',
  BarleyWine = 'barleyWine',
  IPA = 'ipa'
}

export enum BrandName {
  Budweiser = 'budweiser',
  Heineken = 'heineken',
  StellaArtois = 'stellaArtois',
  Corona = 'corona',
  Skol = 'skol',
  Quilmes = 'quilmes',
}

export enum DispenserStatus {
  Open = 'open',
  Close = 'close',
}

