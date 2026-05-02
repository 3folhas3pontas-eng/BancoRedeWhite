package lobby.whiteMinerar.api;

import com.google.gson.JsonObject;

public class MiningInventory {
    
    private String id;
    private String username;
    private int coal;
    private int raw_iron;
    private int raw_copper;
    private int lapis_lazuli;
    private int raw_gold;
    private int redstone;
    private int diamond;
    private int emerald;
    private int string;
    private int rotten_flesh;
    private int bone;
    private int wheat;
    private int gunpowder;
    private int iron_ingot;
    private int gold_ingot;
    private int slimeball;
    private int bucket;
    private int name_tag;
    private int saddle;
    private int music_disc;
    private int golden_apple;
    private int enchanted_golden_apple;
    private int iron_horse_armor;
    private int gold_horse_armor;
    private int diamond_horse_armor;
    private int enchantment_book;
    private int experience_bottle;
    
    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public int getCoal() { return coal; }
    public void setCoal(int coal) { this.coal = coal; }
    
    public int getRaw_iron() { return raw_iron; }
    public void setRaw_iron(int raw_iron) { this.raw_iron = raw_iron; }
    
    public int getRaw_copper() { return raw_copper; }
    public void setRaw_copper(int raw_copper) { this.raw_copper = raw_copper; }
    
    public int getLapis_lazuli() { return lapis_lazuli; }
    public void setLapis_lazuli(int lapis_lazuli) { this.lapis_lazuli = lapis_lazuli; }
    
    public int getRaw_gold() { return raw_gold; }
    public void setRaw_gold(int raw_gold) { this.raw_gold = raw_gold; }
    
    public int getRedstone() { return redstone; }
    public void setRedstone(int redstone) { this.redstone = redstone; }
    
    public int getDiamond() { return diamond; }
    public void setDiamond(int diamond) { this.diamond = diamond; }
    
    public int getEmerald() { return emerald; }
    public void setEmerald(int emerald) { this.emerald = emerald; }
    
    public int getString() { return string; }
    public void setString(int string) { this.string = string; }
    
    public int getRotten_flesh() { return rotten_flesh; }
    public void setRotten_flesh(int rotten_flesh) { this.rotten_flesh = rotten_flesh; }
    
    public int getBone() { return bone; }
    public void setBone(int bone) { this.bone = bone; }
    
    public int getWheat() { return wheat; }
    public void setWheat(int wheat) { this.wheat = wheat; }
    
    public int getGunpowder() { return gunpowder; }
    public void setGunpowder(int gunpowder) { this.gunpowder = gunpowder; }
    
    public int getIron_ingot() { return iron_ingot; }
    public void setIron_ingot(int iron_ingot) { this.iron_ingot = iron_ingot; }
    
    public int getGold_ingot() { return gold_ingot; }
    public void setGold_ingot(int gold_ingot) { this.gold_ingot = gold_ingot; }
    
    public int getSlimeball() { return slimeball; }
    public void setSlimeball(int slimeball) { this.slimeball = slimeball; }
    
    public int getBucket() { return bucket; }
    public void setBucket(int bucket) { this.bucket = bucket; }
    
    public int getName_tag() { return name_tag; }
    public void setName_tag(int name_tag) { this.name_tag = name_tag; }
    
    public int getSaddle() { return saddle; }
    public void setSaddle(int saddle) { this.saddle = saddle; }
    
    public int getMusic_disc() { return music_disc; }
    public void setMusic_disc(int music_disc) { this.music_disc = music_disc; }
    
    public int getGolden_apple() { return golden_apple; }
    public void setGolden_apple(int golden_apple) { this.golden_apple = golden_apple; }
    
    public int getEnchanted_golden_apple() { return enchanted_golden_apple; }
    public void setEnchanted_golden_apple(int enchanted_golden_apple) { this.enchanted_golden_apple = enchanted_golden_apple; }
    
    public int getIron_horse_armor() { return iron_horse_armor; }
    public void setIron_horse_armor(int iron_horse_armor) { this.iron_horse_armor = iron_horse_armor; }
    
    public int getGold_horse_armor() { return gold_horse_armor; }
    public void setGold_horse_armor(int gold_horse_armor) { this.gold_horse_armor = gold_horse_armor; }
    
    public int getDiamond_horse_armor() { return diamond_horse_armor; }
    public void setDiamond_horse_armor(int diamond_horse_armor) { this.diamond_horse_armor = diamond_horse_armor; }
    
    public int getEnchantment_book() { return enchantment_book; }
    public void setEnchantment_book(int enchantment_book) { this.enchantment_book = enchantment_book; }
    
    public int getExperience_bottle() { return experience_bottle; }
    public void setExperience_bottle(int experience_bottle) { this.experience_bottle = experience_bottle; }
    
    /**
     * Converte JsonObject para MiningInventory
     */
    public static MiningInventory fromJson(JsonObject json) {
        MiningInventory inventory = new MiningInventory();
        inventory.setId(json.has("id") ? json.get("id").getAsString() : "");
        inventory.setUsername(json.has("username") ? json.get("username").getAsString() : "");
        inventory.setCoal(json.has("coal") ? json.get("coal").getAsInt() : 0);
        inventory.setRaw_iron(json.has("raw_iron") ? json.get("raw_iron").getAsInt() : 0);
        inventory.setRaw_copper(json.has("raw_copper") ? json.get("raw_copper").getAsInt() : 0);
        inventory.setLapis_lazuli(json.has("lapis_lazuli") ? json.get("lapis_lazuli").getAsInt() : 0);
        inventory.setRaw_gold(json.has("raw_gold") ? json.get("raw_gold").getAsInt() : 0);
        inventory.setRedstone(json.has("redstone") ? json.get("redstone").getAsInt() : 0);
        inventory.setDiamond(json.has("diamond") ? json.get("diamond").getAsInt() : 0);
        inventory.setEmerald(json.has("emerald") ? json.get("emerald").getAsInt() : 0);
        inventory.setString(json.has("string") ? json.get("string").getAsInt() : 0);
        inventory.setRotten_flesh(json.has("rotten_flesh") ? json.get("rotten_flesh").getAsInt() : 0);
        inventory.setBone(json.has("bone") ? json.get("bone").getAsInt() : 0);
        inventory.setWheat(json.has("wheat") ? json.get("wheat").getAsInt() : 0);
        inventory.setGunpowder(json.has("gunpowder") ? json.get("gunpowder").getAsInt() : 0);
        inventory.setIron_ingot(json.has("iron_ingot") ? json.get("iron_ingot").getAsInt() : 0);
        inventory.setGold_ingot(json.has("gold_ingot") ? json.get("gold_ingot").getAsInt() : 0);
        inventory.setSlimeball(json.has("slimeball") ? json.get("slimeball").getAsInt() : 0);
        inventory.setBucket(json.has("bucket") ? json.get("bucket").getAsInt() : 0);
        inventory.setName_tag(json.has("name_tag") ? json.get("name_tag").getAsInt() : 0);
        inventory.setSaddle(json.has("saddle") ? json.get("saddle").getAsInt() : 0);
        inventory.setMusic_disc(json.has("music_disc") ? json.get("music_disc").getAsInt() : 0);
        inventory.setGolden_apple(json.has("golden_apple") ? json.get("golden_apple").getAsInt() : 0);
        inventory.setEnchanted_golden_apple(json.has("enchanted_golden_apple") ? json.get("enchanted_golden_apple").getAsInt() : 0);
        inventory.setIron_horse_armor(json.has("iron_horse_armor") ? json.get("iron_horse_armor").getAsInt() : 0);
        inventory.setGold_horse_armor(json.has("gold_horse_armor") ? json.get("gold_horse_armor").getAsInt() : 0);
        inventory.setDiamond_horse_armor(json.has("diamond_horse_armor") ? json.get("diamond_horse_armor").getAsInt() : 0);
        inventory.setEnchantment_book(json.has("enchantment_book") ? json.get("enchantment_book").getAsInt() : 0);
        inventory.setExperience_bottle(json.has("experience_bottle") ? json.get("experience_bottle").getAsInt() : 0);
        return inventory;
    }
    
    /**
     * Converte MiningInventory para JSON string
     */
    public String toJson() {
        JsonObject json = new JsonObject();
        json.addProperty("coal", coal);
        json.addProperty("raw_iron", raw_iron);
        json.addProperty("raw_copper", raw_copper);
        json.addProperty("lapis_lazuli", lapis_lazuli);
        json.addProperty("raw_gold", raw_gold);
        json.addProperty("redstone", redstone);
        json.addProperty("diamond", diamond);
        json.addProperty("emerald", emerald);
        json.addProperty("string", string);
        json.addProperty("rotten_flesh", rotten_flesh);
        json.addProperty("bone", bone);
        json.addProperty("wheat", wheat);
        json.addProperty("gunpowder", gunpowder);
        json.addProperty("iron_ingot", iron_ingot);
        json.addProperty("gold_ingot", gold_ingot);
        json.addProperty("slimeball", slimeball);
        json.addProperty("bucket", bucket);
        json.addProperty("name_tag", name_tag);
        json.addProperty("saddle", saddle);
        json.addProperty("music_disc", music_disc);
        json.addProperty("golden_apple", golden_apple);
        json.addProperty("enchanted_golden_apple", enchanted_golden_apple);
        json.addProperty("iron_horse_armor", iron_horse_armor);
        json.addProperty("gold_horse_armor", gold_horse_armor);
        json.addProperty("diamond_horse_armor", diamond_horse_armor);
        json.addProperty("enchantment_book", enchantment_book);
        json.addProperty("experience_bottle", experience_bottle);
        return json.toString();
    }
}
