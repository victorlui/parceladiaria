import * as Location from "expo-location";

export async function getFromIP() {
  const resp = await fetch("https://freeipapi.com/api/json");
  console.log("resp", resp);
  const data = await resp.json();
  console.log("data", data);
  return null;
}

export async function getFromGPS() {
  try {
    // pede permissão
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Permissão de localização negada");
      return null;
    }

    // pega posição atual
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const { coords } = pos;
    if (!coords) return null;

    // reverse geocode para obter cidade/estado/país
    const places = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    // places geralmente é um array; pega o primeiro
    const p = places && places.length ? places[0] : null;
    if (!p) return null;

    // Exemplos de campos em p: city, region, country, postalCode, name
    return {
      city: p.city ?? p.subregion ?? p.region, // fallback heurístico
      region: p.region,
      country: p.country,
    };
  } catch (e) {
    console.warn("getFromGPS erro:", e);
    return null;
  }
}
