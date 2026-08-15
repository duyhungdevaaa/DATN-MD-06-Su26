/**
 * Utility to parse raw shipping address strings and fetch GHN location names.
 * Raw address format from Android app:
 * "addressId|||districtId|||wardCode|||Label: Name - Phone\nAddressDetail"
 */

const GHN_TOKEN = "ecefb2fb-7203-11f1-a973-aee5264794df";

// Caches for GHN districts and wards
const districtMap: Record<number, string> = {};
const wardMap: Record<string, string> = {};

let isFetchingDistricts = false;

export async function fetchGHNDistricts() {
  if (Object.keys(districtMap).length > 0 || isFetchingDistricts) return;
  isFetchingDistricts = true;
  try {
    const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district", {
      headers: { "Token": GHN_TOKEN }
    });
    const json = await res.json();
    if (json.code === 200 && json.data) {
      json.data.forEach((d: any) => {
        districtMap[d.DistrictID] = d.DistrictName;
      });
    }
  } catch (e) {
    console.warn("GHN District fetch failed:", e);
  } finally {
    isFetchingDistricts = false;
  }
}

export async function fetchGHNWards(districtId: number) {
  if (!districtId) return;
  try {
    const res = await fetch(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`, {
      headers: { "Token": GHN_TOKEN }
    });
    const json = await res.json();
    if (json.code === 200 && json.data) {
      json.data.forEach((w: any) => {
        wardMap[w.WardCode] = w.WardName;
      });
    }
  } catch (e) {
    console.warn("GHN Ward fetch failed:", e);
  }
}

export function parseRawAddress(raw: string) {
  if (!raw) {
    return {
      addressId: "",
      districtId: 0,
      wardCode: "",
      cleanAddress: "Tại cửa hàng",
      extractedName: "",
      extractedPhone: ""
    };
  }

  let str = raw;
  let addressId = "";
  let districtId = 0;
  let wardCode = "";

  // 1. Separate "addressId|||districtId|||wardCode|||..."
  if (str.includes("|||")) {
    const parts = str.split("|||");
    if (parts.length >= 4) {
      addressId = parts[0];
      districtId = parseInt(parts[1], 10) || 0;
      wardCode = parts[2];
      str = parts[3];
    } else {
      str = parts[parts.length - 1];
    }
  }

  let extractedName = "";
  let extractedPhone = "";

  // 2. Extract Name & Phone if pattern "Label: Name - Phone\nAddress" exists
  if (str.includes(" - ")) {
    try {
      const dashIdx = str.indexOf(" - ");
      const namePart = str.substring(0, dashIdx);
      if (namePart.includes(": ")) {
        extractedName = namePart.substring(namePart.indexOf(": ") + 2).trim();
      } else {
        extractedName = namePart.trim();
      }

      const afterDash = str.substring(dashIdx + 3);
      const newlineIdx = afterDash.indexOf("\n");
      if (newlineIdx !== -1) {
        extractedPhone = afterDash.substring(0, newlineIdx).trim();
        str = afterDash.substring(newlineIdx + 1).trim();
      } else {
        // Look for phone number pattern 0x...
        const phoneMatch = afterDash.match(/(0[35789]\d{8})/);
        if (phoneMatch) {
          extractedPhone = phoneMatch[1];
          str = afterDash.substring(phoneMatch[1].length).trim();
        }
      }
    } catch (e) {
      console.warn("Error parsing address sub-fields:", e);
    }
  }

  // Also check if phone is embedded somewhere in string if not yet found
  if (!extractedPhone) {
    const phoneMatch = str.match(/(0[35789]\d{8})/);
    if (phoneMatch) {
      extractedPhone = phoneMatch[1];
    }
  }

  // 3. Clean address label prefix like "Địa chỉ: ", "Nhà riêng: ", "Văn phòng: "
  str = str.replace(/^(Địa chỉ|Nhà riêng|Văn phòng):\s*/i, "").trim();

  // If address has location names via GHN cache:
  const districtName = districtId ? districtMap[districtId] : "";
  const wardName = wardCode ? wardMap[wardCode] : "";

  let finalAddress = str;
  if (districtName && !finalAddress.includes(districtName)) {
    finalAddress += `, ${districtName}`;
  }
  if (wardName && !finalAddress.includes(wardName)) {
    finalAddress += `, ${wardName}`;
  }

  return {
    addressId,
    districtId,
    wardCode,
    cleanAddress: finalAddress || "Tại cửa hàng",
    extractedName,
    extractedPhone
  };
}
