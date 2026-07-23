package fpoly.DatnMD06Su26.trendify.model;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import androidx.annotation.NonNull;

import com.google.firebase.Timestamp;
import com.google.firebase.firestore.DocumentSnapshot;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Voucher {

    private String voucherId;
    private String code;
    private long discountAmount;
    private double discountRate;
    private String expirationDate;
    private long maximumDiscount;

    public Voucher() {
    }

    public Voucher(String voucherId, String code, long discountAmount, double discountRate, String expirationDate, long maximumDiscount) {
        this.voucherId = voucherId;
        this.code = code;
        this.discountAmount = discountAmount;
        this.discountRate = discountRate;
        this.expirationDate = expirationDate;
        this.maximumDiscount = maximumDiscount;
    }

    public String getVoucherId() {
        return voucherId;
    }

    public String getCode() {
        return code;
    }

    public long getDiscountAmount() {
        return discountAmount;
    }

    public double getDiscountRate() {
        return discountRate;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public long getMaximumDiscount() {
        return maximumDiscount;
    }

    public boolean isExpired() {
        if (expirationDate == null || expirationDate.isEmpty()) {
            return false;
        }
        Date expiration = parseDate(expirationDate);
        if (expiration == null) {
            return false;
        }
        Date today = new Date();
        return expiration.before(today);
    }

    public long calculateDiscount(long subtotal) {
        long fixedDiscount = Math.max(0, discountAmount);
        long rateDiscount = Math.round(subtotal * (discountRate / 100.0));
        long discount = Math.max(fixedDiscount, rateDiscount);
        if (maximumDiscount > 0 && discount > maximumDiscount) {
            discount = maximumDiscount;
        }
        return Math.max(0, discount);
    }

    @NonNull
    public static Voucher fromDocument(@NonNull DocumentSnapshot document) {
        String voucherId = document.getId();
        String code = document.getString("code");
        long discountAmount = parseLong(document.get("discountAmount"));
        double discountRate = parseDouble(document.get("discountRate"));
        String expirationDate = document.getString("expirationDate");
        long maximumDiscount = parseLong(document.get("maximumDiscount"));

        if (code == null) {
            code = "";
        }

        return new Voucher(voucherId, code, discountAmount, discountRate, expirationDate, maximumDiscount);
    }

    private static long parseLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            String text = value.toString().replaceAll("[^0-9-]", "");
            if (text.isEmpty()) {
                return 0L;
            }
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private static double parseDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            String text = value.toString().trim().replaceAll("[^0-9.,-]", "");
            text = text.replace(',', '.');
            if (text.isEmpty()) {
                return 0.0;
            }
            return Double.parseDouble(text);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private static Date parseDate(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        String[] formats = {"dd/MM/yyyy", "dd/MM/yy", "yyyy-MM-dd"};
        for (String format : formats) {
            try {
                return new SimpleDateFormat(format, Locale.getDefault()).parse(value);
            } catch (ParseException ignored) {
            }
        }
        return null;
    }
}
