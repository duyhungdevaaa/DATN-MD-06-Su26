package fpoly.DatnMD06Su26.trendify.model;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

public class UserAddress {
    private String id;
    private String type;
    private String label;
    private String name;
    private String phone;
    private String address;
    private boolean isDefault;
    private int districtId;
    private String wardCode;

    public UserAddress() {
    }

    public UserAddress(String id, String type, String label, String name, String phone, String address, boolean isDefault, int districtId, String wardCode) {
        this.id = id;
        this.type = type;
        this.label = label;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.isDefault = isDefault;
        this.districtId = districtId;
        this.wardCode = wardCode;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getLabel() {
        return label;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public int getDistrictId() {
        return districtId;
    }

    public void setDistrictId(int districtId) {
        this.districtId = districtId;
    }

    public String getWardCode() {
        return wardCode;
    }

    public void setWardCode(String wardCode) {
        this.wardCode = wardCode;
    }
}
