#!/bin/bash

root_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ssl_dir=$root_dir/ssl

mkdir -p $root_dir/ssl

if [[ ! -f $ssl_dir/privatekey.pem || ! -f $ssl_dir/certificate.pem ]]; then
  echo ">> Generating SSL key and certificate..."
  rm -rf $ssl_dir/*

  pushd $ssl_dir > /dev/null
  openssl genrsa -out privatekey.pem 1024
  openssl req -new -key privatekey.pem -out certrequest.csr 
  openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
  popd > /dev/null

  echo
  echo 'done!'
fi
