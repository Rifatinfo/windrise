export const bangladeshDivisions: { name: string; districts: string[] }[] = [
  {
    name: 'Barishal',
    districts: ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  },
  {
    name: 'Chattogram',
    districts: [
      'Bandarban',
      'Brahmanbaria',
      'Chandpur',
      'Chattogram',
      "Cox's Bazar",
      'Feni',
      'Khagrachhari',
      'Lakshmipur',
      'Noakhali',
      'Rangamati',
      'Cumilla',
    ],
  },
  {
    name: 'Dhaka',
    districts: [
      'Dhaka',
      'Faridpur',
      'Gazipur',
      'Gopalganj',
      'Kishoreganj',
      'Madaripur',
      'Manikganj',
      'Munshiganj',
      'Narayanganj',
      'Narsingdi',
      'Rajbari',
      'Shariatpur',
      'Tangail',
    ],
  },
  {
    name: 'Khulna',
    districts: [
      'Bagerhat',
      'Chuadanga',
      'Jessore (Jashore)',
      'Jhenaidah',
      'Khulna',
      'Kushtia',
      'Magura',
      'Meherpur',
      'Narail',
      'Satkhira',
    ],
  },
  {
    name: 'Mymensingh',
    districts: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  },
  {
    name: 'Rajshahi',
    districts: [
      'Bogra (Bogura)',
      'Joypurhat',
      'Naogaon',
      'Natore',
      'Chapai Nawabganj',
      'Pabna',
      'Rajshahi',
      'Sirajganj',
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      'Dinajpur',
      'Gaibandha',
      'Kurigram',
      'Lalmonirhat',
      'Nilphamari',
      'Panchagarh',
      'Rangpur',
      'Thakurgaon',
    ],
  },
  {
    name: 'Sylhet',
    districts: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  },
]

export const divisionNames = bangladeshDivisions.map((division) => division.name)

export const allDistricts = bangladeshDivisions.flatMap((division) =>
  division.districts.map((district) => ({ district, division: division.name })),
)

export function districtsForDivision(divisionName: string): string[] {
  if (!divisionName) return allDistricts.map((entry) => entry.district).sort()
  return bangladeshDivisions.find((division) => division.name === divisionName)?.districts ?? []
}

export function divisionForDistrict(districtName: string): string | undefined {
  return allDistricts.find((entry) => entry.district === districtName)?.division
}

export const postcodesByDistrict: Record<string, string[]> = {
  Barguna: ['8700'],
  Barishal: ['8200'],
  Bhola: ['8300'],
  Jhalokati: ['8400'],
  Patuakhali: ['8600'],
  Pirojpur: ['8500'],
  Bandarban: ['4600'],
  Brahmanbaria: ['3400'],
  Chandpur: ['3600'],
  Chattogram: ['4000', '4100', '4200', '4300'],
  "Cox's Bazar": ['4700'],
  Feni: ['3900'],
  Khagrachhari: ['4400'],
  Lakshmipur: ['3700'],
  Noakhali: ['3800'],
  Rangamati: ['4500'],
  Cumilla: ['3500'],
  Dhaka: [
    '1000',
    '1100',
    '1200',
    '1205',
    '1206',
    '1207',
    '1208',
    '1209',
    '1212',
    '1213',
    '1214',
    '1215',
    '1216',
    '1217',
    '1219',
    '1229',
    '1230',
  ],
  Faridpur: ['7800'],
  Gazipur: ['1700', '1701', '1704'],
  Gopalganj: ['8100'],
  Kishoreganj: ['2300'],
  Madaripur: ['7900'],
  Manikganj: ['1800'],
  Munshiganj: ['1500'],
  Narayanganj: ['1400', '1420', '1430'],
  Narsingdi: ['1600'],
  Rajbari: ['7700'],
  Shariatpur: ['8000'],
  Tangail: ['1900'],
  Bagerhat: ['9300'],
  Chuadanga: ['7200'],
  'Jessore (Jashore)': ['7400'],
  Jhenaidah: ['7300'],
  Khulna: ['9000', '9100'],
  Kushtia: ['7000'],
  Magura: ['7600'],
  Meherpur: ['7100'],
  Narail: ['7500'],
  Satkhira: ['9400'],
  Jamalpur: ['2000'],
  Mymensingh: ['2200'],
  Netrokona: ['2400'],
  Sherpur: ['2100'],
  'Bogra (Bogura)': ['5800'],
  Joypurhat: ['5900'],
  Naogaon: ['6500'],
  Natore: ['6400'],
  'Chapai Nawabganj': ['6300'],
  Pabna: ['6600'],
  Rajshahi: ['6000', '6100'],
  Sirajganj: ['6700'],
  Dinajpur: ['5200'],
  Gaibandha: ['5700'],
  Kurigram: ['5600'],
  Lalmonirhat: ['5500'],
  Nilphamari: ['5300'],
  Panchagarh: ['5000'],
  Rangpur: ['5400'],
  Thakurgaon: ['5100'],
  Habiganj: ['3300'],
  Moulvibazar: ['3200'],
  Sunamganj: ['3000'],
  Sylhet: ['3100'],
}

export function postcodesForDistrict(districtName: string): string[] {
  if (districtName && postcodesByDistrict[districtName]) {
    return postcodesByDistrict[districtName].map((code) => `${code} — ${districtName}`)
  }
  return allDistricts.flatMap((entry) =>
    (postcodesByDistrict[entry.district] ?? []).map((code) => `${code} — ${entry.district}`),
  )
}
