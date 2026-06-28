package fpoly.DatnMD06Su26.trendify.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.ChatMessage;

public class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private List<ChatMessage> messageList;

    public ChatAdapter(List<ChatMessage> messageList) {
        this.messageList = messageList;
    }

    @Override
    public int getItemViewType(int position) {
        return messageList.get(position).getType();
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == ChatMessage.TYPE_USER) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_user, parent, false);
            return new UserMessageViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_bot, parent, false);
            return new BotMessageViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ChatMessage message = messageList.get(position);
        if (holder instanceof UserMessageViewHolder) {
            ((UserMessageViewHolder) holder).tvUserMessage.setText(message.getText());
        } else if (holder instanceof BotMessageViewHolder) {
            BotMessageViewHolder botHolder = (BotMessageViewHolder) holder;
            if (message.getType() == ChatMessage.TYPE_BOT_TYPING) {
                botHolder.tvBotMessage.setVisibility(View.GONE);
                botHolder.ivBotAvatar.setAnimation(R.raw.avata_khinhantin);
                botHolder.ivBotAvatar.playAnimation();
            } else {
                botHolder.tvBotMessage.setVisibility(View.VISIBLE);
                botHolder.tvBotMessage.setText(message.getText());
                botHolder.ivBotAvatar.setAnimation(R.raw.chatbot);
                botHolder.ivBotAvatar.playAnimation();
            }
            if (botHolder.ivBotAvatar != null) {
                if (isUserTyping) {
                    botHolder.ivBotAvatar.setSpeed(2.5f);
                } else {
                    botHolder.ivBotAvatar.setSpeed(1.0f);
                }
            }
        }
    }

    private boolean isUserTyping = false;

    public void setUserTyping(boolean isUserTyping) {
        if (this.isUserTyping != isUserTyping) {
            this.isUserTyping = isUserTyping;
            notifyDataSetChanged();
        }
    }

    @Override
    public int getItemCount() {
        return messageList.size();
    }

    static class UserMessageViewHolder extends RecyclerView.ViewHolder {
        TextView tvUserMessage;

        UserMessageViewHolder(@NonNull View itemView) {
            super(itemView);
            tvUserMessage = itemView.findViewById(R.id.tvUserMessage);
        }
    }

    static class BotMessageViewHolder extends RecyclerView.ViewHolder {
        TextView tvBotMessage;
        com.airbnb.lottie.LottieAnimationView ivBotAvatar;

        BotMessageViewHolder(@NonNull View itemView) {
            super(itemView);
            tvBotMessage = itemView.findViewById(R.id.tvBotMessage);
            ivBotAvatar = itemView.findViewById(R.id.ivBotAvatar);
        }
    }
}
