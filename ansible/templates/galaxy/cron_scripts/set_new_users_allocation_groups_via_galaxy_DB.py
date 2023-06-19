

import json
import datetime,psycopg2
from pprint import pprint
import requests

###################################################################################  
# Set the desired allocations according to the User provenance (Code in IDP infos)

galaxy_db_name="galaxy"
galaxy_db_user="galaxy"
galaxy_db_password=""

###################################################################################
# Open edugain idps JSON file and store in an array
# For details on Edugain IDPs info definition: https://technical.edugain.org/api.php

f = open('edugain_idps.json')
try:
    idps = json.load(f)
except:
    exit()

##################################################################################
# Establishing the connection to the database
conn = psycopg2.connect(
   database='galaxy', user='galaxy', password='uFscddf923LQAqH3e', host='cg-usegal-db', port= '5432'
)

###################################################################################
# Fetch the CILogon non expired session tokens in galaxy DB
cursor = conn.cursor()
cursor.execute("SELECT galaxy_user.email,custos_authnz_token.access_token FROM galaxy_user,custos_authnz_token WHERE custos_authnz_token.expiration_time > NOW() AND galaxy_user.id=custos_authnz_token.user_id")
custos_authnz_tokens = cursor.fetchall()

###################################################################################
# Create general provenance groups for allocations if not in Galaxy DB
#
cursor.execute("SELECT * FROM galaxy_group WHERE name='CanadianUsersAllocationGroup'")
groups=cursor.fetchall()
if len(groups) == 0:
    cursor.execute("INSERT INTO galaxy_group (create_time,update_time,name,deleted) VALUES (NOW(),NOW(),'CanadianUsersAllocationGroup',false)")
    conn.commit()

# Fetch Canadian users group id
cursor.execute("SELECT id FROM galaxy_group WHERE name='CanadianUsersAllocationGroup'")
Canadian_Users_group_id=cursor.fetchone()[0]

# Loop over the tokens and Fetch detailed info at CILogon for each 

for token in custos_authnz_tokens:

    # Extract user session information and galaxy user id
    galaxy_user_email=token[0]
    headers={'Authorization': 'Bearer {}'.format(token[1]), 'Accept' : 'application/json' }  
    r = requests.get('https://cilogon.org/oauth2/userinfo', headers=headers)
    user_session_infos=r.json()

    # Fetch galaxy user id
    cursor.execute("SELECT id FROM galaxy_user WHERE email='"+galaxy_user_email+"'")
    galaxy_user_id=cursor.fetchone()[0]

    # Get infos of IDP used to authenticate
    session_idp=None
    for idp in idps:
        if idp[0]['entityid'] == user_session_infos['idp']:
            user_session_idp=idp[0]
    
    if user_session_idp is None:
        # User not in Edugain network of institutions
        print("IDP not in Edugain list. User not in Edugain network of insitutions.")
        # Terminate the user account ?

    else:
        if user_session_idp['code'] == 'CAF':
            # Add user to Canadian users group (if needed)
            cursor.execute("SELECT id FROM user_group_association WHERE user_id="+str(galaxy_user_id)+" AND group_id="+str(Canadian_Users_group_id))
            if len(cursor.fetchall())==0:
                cursor.execute( "INSERT INTO user_group_association (create_time,update_time,user_id,group_id) VALUES (NOW(),NOW(),"+str(galaxy_user_id)+","+str(Canadian_Users_group_id)+")" )
                conn.commit()
                print("User Added to Canadian Users grous")

        else:
            print("User NOT Canadian but is part of Edugain Network")
            print()


#Closing db connection
conn.close()


