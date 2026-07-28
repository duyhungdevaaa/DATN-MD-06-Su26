git config i18n.commitEncoding utf-8

git add app/src/main/res/values/colors.xml
git add app/src/main/res/values/trendify_colors.xml
git add app/src/main/res/values/themes.xml
git add app/src/main/res/values-night/themes.xml
git add app/src/main/res/drawable/bg_button_outline_new.xml
git add app/src/main/res/drawable/bg_button_primary.xml
git add app/src/main/res/drawable/bg_card_surface.xml
git add app/src/main/res/drawable/bg_input_field.xml
git commit -F msg1.txt

git rm --cached app/src/main/java/fpoly/DatnMD06Su26/trendify/activity/OnboardingActivity.java
git rm --cached app/src/main/java/fpoly/DatnMD06Su26/trendify/adapter/OnboardingAdapter.java
git rm --cached app/src/main/java/fpoly/DatnMD06Su26/trendify/model/OnboardingItem.java
git rm --cached app/src/main/res/layout/activity_onboarding.xml
git rm --cached app/src/main/res/layout/item_onboarding.xml
git add app/src/main/AndroidManifest.xml
git commit -F msg2.txt

git add app/src/main/res/layout/activity_main.xml
git add app/src/main/res/layout/fragment_home.xml
git add app/src/main/res/layout/item_product.xml
git add app/src/main/res/layout/item_flash_sale.xml
git add app/src/main/res/layout/activity_product_detail.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/fragment/HomeFragment.java
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/adapter/ProductAdapter.java
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/activity/ProductDetailActivity.java
git commit -F msg3.txt

git add app/src/main/res/layout/fragment_category.xml
git add app/src/main/res/layout/item_category_left.xml
git add app/src/main/res/layout/item_category_right.xml
git add app/src/main/res/layout/item_category.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/fragment/CategoryFragment.java
git commit -F msg4.txt

git add app/src/main/res/layout/activity_cart.xml
git add app/src/main/res/layout/item_cart.xml
git add app/src/main/res/layout/activity_order_history.xml
git add app/src/main/res/layout/item_order_history.xml
git add app/src/main/res/layout/item_shipping_address.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/activity/CartActivity.java
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/adapter/CartAdapter.java
git commit -F msg5.txt

git add app/src/main/res/layout/fragment_profile.xml
git add app/src/main/res/layout/activity_settings.xml
git add app/src/main/res/layout/activity_login.xml
git add app/src/main/res/layout/activity_register.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/fragment/ProfileFragment.java
git commit -F msg6.txt

git add app/src/main/res/layout/item_chat_bot.xml
git add app/src/main/res/layout/item_chat_user.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/adapter/BannerAdapter.java
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/adapter/ChatAdapter.java
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/model/BannerItem.java
git add app/src/main/res/layout/activity_splash.xml
git add app/src/main/java/fpoly/DatnMD06Su26/trendify/activity/SplashActivity.java
git commit -F msg7.txt

git add app/
git commit -m "Clean up residual changes after UI redesign"

git push -f origin thien
