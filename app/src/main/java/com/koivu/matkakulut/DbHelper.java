package com.koivu.matkakulut;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;
import org.json.JSONTokener;

import java.util.Arrays;

/**
 * Created by janne on 29/05/16.
 */
public class DbHelper extends SQLiteOpenHelper {
    private static final java.lang.String SQL_CREATE_ENTRIES = "create table events(participants TEXT, payer TEXT, event TEXT, amount TEXT)";

    public DbHelper(Context context) {
            super(context, "Matkakulut.db", null, 9);

        }
        @Override
        public void onCreate(SQLiteDatabase db) {
            System.out.println("Creating table structure");
            db.execSQL(SQL_CREATE_ENTRIES);
            System.out.println("Done.");

        }

    @JavascriptInterface
    public boolean addEvent(String participants, String payer, String event, String amount){
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put("participants", participants);
        values.put("event", event);
        values.put("amount", amount);
        values.put("payer", payer);

        db.insert("events", null, values);
        db.close();
        return true;
    }

    @JavascriptInterface
    public String getEvents(){
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT  * FROM EVENTS", null);

        boolean hasFirst = cursor.moveToFirst();
        if( ! hasFirst ){
            JSONArray array = new JSONArray(Arrays.asList(new String[]{}));
            String returnArray = array.toString();
            //Log.w("com.koivu.matkakulut", returnArray);
            return returnArray;
        }
        JSONArray array = new JSONArray();

        do {
            try {
                String name = cursor.getString( cursor.getColumnIndex("event"));
                String participants = cursor.getString( cursor.getColumnIndex("participants"));

                String payer = cursor.getString( cursor.getColumnIndex("payer"));

                String amount = cursor.getString( cursor.getColumnIndex("amount"));
                JSONObject jsonObj = new JSONObject();
                jsonObj.accumulate("payer", payer);
                jsonObj.accumulate("amount", amount);
                jsonObj.accumulate("name", name);
                String[] ar = {"One", "Two"};
                JSONArray jsonArray = new JSONArray(participants);
                //JSONArray participantArray = (JSONArray) participantObject;

                //jsonObj.accumulate("participants", participants);
                jsonObj.accumulate("participants",jsonArray);
                //jsonObj.accumulate("participants", ar);

                array.put( jsonObj );
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }while( cursor.moveToNext());

        db.close();

        return array.toString();
    }


    @JavascriptInterface
    public String getTravellers(){
        JSONArray array = new JSONArray(Arrays.asList(new String[]{"One", "Two", "Three"}));
        String returnArray = array.toString();
        return returnArray;

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS EVENTS");

        // Create tables again
        onCreate(db);
    }


}
