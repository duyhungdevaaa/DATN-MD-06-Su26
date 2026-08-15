package fpoly.DatnMD06Su26.trendify.compose

import android.app.Activity
import android.content.Intent
import androidx.annotation.DrawableRes
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import fpoly.DatnMD06Su26.trendify.R
import fpoly.DatnMD06Su26.trendify.activity.MainActivity

/**
 * Data item representing a navigation tab
 */
data class NavItem(
    val title: String,
    @DrawableRes val iconRes: Int,
    val tabIndex: Int
)

val TrendifyNavItems = listOf(
    NavItem("Trang chủ", R.drawable.ic_home, 0),
    NavItem("Tìm kiếm", R.drawable.ic_search, 1),
    NavItem("Danh mục", R.drawable.ic_category_nav, 2),
    NavItem("Yêu thích", R.drawable.ic_favorite, 3),
    NavItem("Tài khoản", R.drawable.ic_person, 4)
)

/**
 * Modern Jetpack Compose Floating Bottom Navigation Bar
 */
@Composable
fun TrendifyBottomNav(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    // Surface Floating Card Container
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 16.dp,
                    shape = RoundedCornerShape(28.dp),
                    spotColor = Color(0x33000000),
                    ambientColor = Color(0x1A000000)
                ),
            shape = RoundedCornerShape(28.dp),
            color = Color.White.copy(alpha = 0.98f),
            tonalElevation = 6.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 6.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TrendifyNavItems.forEach { item ->
                    val isSelected = selectedTab == item.tabIndex
                    
                    // Spring bounce scale animation for icon
                    val iconScale by animateFloatAsState(
                        targetValue = if (isSelected) 1.15f else 1.0f,
                        animationSpec = spring(
                            dampingRatio = Spring.DampingRatioMediumBouncy,
                            stiffness = Spring.StiffnessMedium
                        ),
                        label = "iconScale"
                    )

                    // Color transitions
                    val iconTint by animateColorAsState(
                        targetValue = if (isSelected) Color(0xFF1E293B) else Color(0xFF94A3B8),
                        label = "iconTint"
                    )
                    val textColor by animateColorAsState(
                        targetValue = if (isSelected) Color(0xFF1E293B) else Color(0xFF94A3B8),
                        label = "textColor"
                    )
                    val pillBgColor by animateColorAsState(
                        targetValue = if (isSelected) Color(0xFFF1F5F9) else Color.Transparent,
                        label = "pillBgColor"
                    )

                    val interactionSource = remember { MutableInteractionSource() }

                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(pillBgColor)
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                onTabSelected(item.tabIndex)
                            }
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            painter = painterResource(id = item.iconRes),
                            contentDescription = item.title,
                            tint = iconTint,
                            modifier = Modifier
                                .size(22.dp)
                                .scale(iconScale)
                        )
                        
                        Spacer(modifier = Modifier.height(2.dp))

                        Text(
                            text = item.title,
                            color = textColor,
                            fontSize = 10.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            maxLines = 1
                        )

                        Spacer(modifier = Modifier.height(2.dp))

                        // Active Indicator Dot
                        Box(
                            modifier = Modifier
                                .size(if (isSelected) 4.dp else 0.dp)
                                .background(
                                    if (isSelected) Color(0xFF1E293B) else Color.Transparent,
                                    CircleShape
                                )
                        )
                    }
                }
            }
        }
    }
}

/**
 * Java Interop Bridge Helper for binding to any Activity
 */
object TrendifyNavBridge {

    const val EXTRA_TARGET_TAB = "EXTRA_TARGET_TAB"

    @JvmStatic
    @JvmOverloads
    fun bind(
        composeView: ComposeView,
        currentTabIndex: Int,
        activity: Activity,
        onTabChangeCallback: ((Int) -> Unit)? = null
    ) {
        composeView.setContent {
            var selectedTab by remember { mutableStateOf(currentTabIndex) }

            TrendifyBottomNav(
                selectedTab = selectedTab,
                onTabSelected = { targetIndex ->
                    selectedTab = targetIndex

                    if (activity is MainActivity) {
                        // If already in MainActivity, just switch the ViewPager tab
                        if (onTabChangeCallback != null) {
                            onTabChangeCallback(targetIndex)
                        } else {
                            activity.switchTab(targetIndex)
                        }
                    } else {
                        // If in any sub-activity, smoothly navigate back to MainActivity at targetTab
                        val intent = Intent(activity, MainActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                            putExtra(EXTRA_TARGET_TAB, targetIndex)
                        }
                        activity.startActivity(intent)
                        activity.finish()
                    }
                }
            )
        }
    }
}
